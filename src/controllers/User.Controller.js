import User from "../models/User.Model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import wrapAsync from "../utils/wrapAsync.js";
import crypto from 'crypto';
import { uploadFileOnLocalAndCloudinary } from "../config/Cloudinary.Config.js";
import { generateOTP } from "../utils/generateOTP.js";
import jwt from 'jsonwebtoken'
import { SendEmailVerificationOTP } from "../utils/emailVerificationLink.js";
import { SendResetPasswordOTP } from "../utils/resetPasswordLink.js";
import generateJWTTokenForEmailVerification from "../utils/generateJWTForEmailVerification.js";



const getEmailPage = (_, res) => {
    res
        .status(200)
        .json({
            message: "User Registration Page"
        })
};

const getEmailToVerify = wrapAsync(async (req, res, next) => {

    const { email } = req.body;

    if (!email) return next(new ApiError(400, "Email is Required"));

    const user = await User.findOne({ email });

    const token = generateJWTTokenForEmailVerification(email);

    if (user) return res.status(200).json(new ApiResponse(true, "User with this email already exists", token))

    const OTP = generateOTP();

    SendEmailVerificationOTP(email, OTP);

    const newUser = new User({ email });
    newUser.otp = OTP;
    await newUser.save();

    return res
        .status(200)
        .json(
            new ApiResponse(true, "OTP has been sent please verity it", token)
        )
});

const verifyEmailAndSetUserDocument = wrapAsync(async (req, res, next) => {

    const { OTP, newPassword, confirmPassword } = req.body;

    if (!OTP) return next(new ApiError(400, "OTP must be required"));
    if (!(newPassword && confirmPassword)) return next(new ApiError(400, "Password & Confirm Password is required"));

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) return next(new ApiError(404, "Access Token Not Found"));

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodeToken) return next(new ApiError(400, "Invalid Access Token"));

    const user = await User.findOne({ email: decodeToken.email });

    if (!user) return next(new ApiError(404, "User Not Found"));

    if (user.otp !== OTP) return next(new ApiError(400, "Invalid OTP"));

    if (newPassword !== confirmPassword) return next(new ApiError(400, "New & Confirm password not match"));

    // After the above validation when everything is Clear
    const randomReferredCode = crypto.randomBytes(3).readUIntBE(0, 3).toString().padStart(8, '0');

    user.password = newPassword;
    user.is_verified = true;
    user.referredCode = randomReferredCode;

    const createdUser = await user.save();

    const accessToken = await createdUser.generateAccessToken();

    if (!createdUser) return next(new ApiError(400, "Something went wrong while registering new user !!"));

    return res
        .status(200)
        .json(
            new ApiResponse(true, "User Registerd Successfully", { createdUser, accessToken })
        )
});


const loginPage = (_, res) => {
    // render login form page
    return res
        .status(200)
        .json(
            new ApiResponse(true, "Login Page", {})
        )
}

const Login = wrapAsync(async (req, res, next) => {
    // get data from frontend
    const { email, password } = req.body;

    // validation - fields not empty 
    if ([email, password].some((field) => field?.trim == "")) return next(new ApiError(400, "Email and Password are required"));

    // check user with ( customerName or email )
    const user = await User.findOne({ email });

    if (!user) return next(new ApiError(400, "User Not Found"));

    if (!user.is_verified) return next(new ApiError(400, "Please verify your mail"));

    // check is password correct
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) return next(new ApiError(401, "Invalid Credentials"));


    // set or access-token & refresh-token 
    const accessToken = await user.generateAccessToken();

    // remove refresh-token from response 
    const loggedInUser = await User.findById(user._id).select("-password -token");

    return res
        .status(200)
        .json(
            new ApiResponse(
                true,
                "Login Successfull",
                { loggedInUser, accessToken }
            )
        )
});

const Logout = wrapAsync(async (_, res, next) => {

    // const cookieOptions = {
    //     httpOnly: true,
    //     secure: true
    // }

    return res
        .status(200)
        .json(
            new ApiResponse(true, "Logout Successfully")
        )

});

const resetPasswordPage = (req, res) => {
    // render reset-password-page
    return res
        .status(200)
        .json(
            new ApiResponse(true, "Reset Password Page")
        )
}

const resetPassword = wrapAsync(async (req, res, next) => {
    // get email from frontend 
    const { email } = req.body;

    if (!email) return next(new ApiError(400, "Email is Required"));

    // check user with email 
    const user = await User.findOne({ email });

    if (!user) return next(new ApiError(404, "User Not Found"));

    // send resetPassword-verification link
    // sendResetPasswordLink(user._id, user.email);
    const OTP = generateOTP();

    SendResetPasswordOTP(user.email, OTP);

    user.rp_otp.push(OTP);

    await user.save();

    const token = generateJWTTokenForEmailVerification(user.email);

    return res
        .status(200)
        .json(
            new ApiResponse(true, "Reset Password OTP has been sent", token)
        )
});

const verifyOTPAndSetNewPassword = wrapAsync(async (req, res, next) => {

    const token = req.cookies.accessToken || req.header("Authorization").replace("Bearer ", "");
    const { OTP, newPassword, confirmPassword } = req.body;

    if (!token) return next(new ApiError(404, "Access Token Not Found"));

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodeToken) return next(new ApiError(400, "Invalid Access Token"));

    const user = await User.findOne({ email: decodeToken.email });

    if (!user) return next(new ApiError(404, "User Not Found"));

    if (!user.rp_otp.includes(OTP)) return next(new ApiError(400, "Invalid Reset Password OTP"));

    if (!(newPassword && confirmPassword)) return next(new ApiError(400, "New & Confirm Password not match"));

    user.password = newPassword;
    await user.save();

    // render newPasswordPage with ( id ) 
    return res
        .status(200)
        .json(
            new ApiResponse(true, "Password has successfully updated . Please login with new password", {})
        )
});

// Secure Controller's
const userSetProfilePage = wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.user?._id).select("-password -rp_token -token");

    if (!user) return next(new ApiError(404, "User Not Found"));

    return res
        .status(200)
        .json(
            new ApiResponse(true, "User profile updation page", user)
        )
});


const userSetProfile = wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.user?._id);

    if (!user) return next(new ApiError(404, "User Not Found"));

    const { firstName, lastName, country, gender } = req.body;

    if (firstName) {
        const randomcustomerName = crypto.randomBytes(3).readUIntBE(0, 3).toString().padStart(5, '0');
        user.firstName = firstName;
        user.username = `${firstName}_${randomcustomerName}`;
    }else{
        user.username = `unknown_${randomcustomerName}`
    }
    if (lastName) user.lastName = lastName;


    if (req.file) {
        const response = await uploadFileOnLocalAndCloudinary(req.file?.path)
        if (response) {
            user.profileImage = response.url;
        }
    } else {
        user.profileImage = user.profileImage;
    }

    user.fullName = (firstName || user.firstName) + ' ' + (lastName || user.lastName);
    user.country = (country || user.country);
    user.gender = (gender || user.gender);

    const updatedUser = await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(true, "User Profile Updated", updatedUser)
        )
});


const userProfile = wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.user?._id).select("-password -rp_token -token");

    if (!user) return next(new ApiError(404, "User Not Found"));

    return res
        .status(200)
        .json(
            new ApiResponse(true, "User Profile Detail", user)
        )
});

export {
    getEmailPage,
    getEmailToVerify,
    loginPage,
    Login,
    resetPasswordPage,
    resetPassword,
    verifyOTPAndSetNewPassword,
    // secure controllers
    Logout,
    userSetProfilePage,
    userSetProfile,
    userProfile,
    verifyEmailAndSetUserDocument
}