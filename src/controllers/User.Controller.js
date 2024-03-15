import User from "../models/User.Model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import wrapAsync from "../utils/wrapAsync.js";
import { SendEmailVerificationLink } from '../utils/emailVerificationLink.js'
import sendResetPasswordLink from "../utils/resetPasswordLink.js";
import crypto from 'crypto';


const registerPage = (_, res) => {
    res
        .status(200)
        .json({
            message: "User Registration Page"
        })
}

const Register = wrapAsync(async (req, res, next) => {
    // get data from frontend 
    const { email, password } = req.body;

    // validation - fields not empty
    if ([email, password].some((field) => field?.trim == "")) return next(new ApiError(400, "Please Fill all Fields Completely"));

    // check if user already exists
    const isUser = await User.findOne({ email });

    if (isUser) return next(new ApiError(400, "User Already Exists"))

    // create user object - create entry in db
    const newUser = new User({ email, password });
    const randomRerredCode = crypto.randomBytes(3).readUIntBE(0, 3).toString().padStart(8, '0');
    newUser.referredCode = randomRerredCode || newUser.referredCode;

    if (req.query.referredCode) {
        const user = await User.findOne({ referredCode: req.query.referredCode });
        if (!user) return next(new ApiError(404, "User Not Found"));
        user.directReferred = newUser.referredCode;
        await user.save();
    }

    const createdUser = await newUser.save();

    // remove password field from response 
    // const createdUser = await User.findById(newUser._id).select("-password -rp_token");

    // check for user creation 
    if (!createdUser) return next(new ApiError(400, "Something went wrong while registering user"))


    SendEmailVerificationLink(createdUser._id, createdUser.email);

    // return response
    return res
        .status(201)
        .json(
            new ApiResponse(true, "User Created Successfully, Please Verify your Mail", createdUser)
        )
});


const verifyMail = wrapAsync(async (req, res, next) => {

    const { id, expiry, token } = req.query;

    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime > expiry) return next(new ApiError(400, "Email Verification Link is Expired"));

    const user = await User.findById(id);

    if (!user) return next(new ApiError(404, "User Not Found"));

    if (user.token) return next(new ApiError(400, "Email Verification has already been used"));

    user.token = token;
    user.is_verified = true;

    await user.save();

    const accessToken = await user.generateAccessToken();

    return res
        .status(200)
        .cookie("accessToken", accessToken)
        .json(
            new ApiResponse(true, "Email has been successfully verified")
        )
})

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

    // check user with ( username or email )
    const user = await User.findOne({ email });

    if (!user) return next(new ApiError(400, "User Not Found"));

    // check is password correct
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) return next(new ApiError(401, "Invalid Credentials"));

    if (!user.is_verified) return next(new ApiError(400, "Please verify your mail"));

    // set or access-token & refresh-token 
    const accessToken = await user.generateAccessToken();

    // remove refresh-token from response 
    const loggedInUser = await User.findById(user._id).select("-password -token");

    // return response
    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                true,
                "Login Successfull",
                { loggedInUser, accessToken }
            )
        )
});

const Logout = wrapAsync(async (req, res, next) => {

    console.log("user ", req.user)

    const cookieOptions = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
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
    sendResetPasswordLink(user._id, user.email);

    return res
        .status(200)
        .json(
            new ApiResponse(true, "Reset Password Link has been sent , please check", {})
        )
});

const resetPasswordLinkVerification = wrapAsync(async (req, res, next) => {
    // get ( id , expiry , rp_token ) from frontend 
    const { id, expiry, rp_token } = req.query;

    // check user with ( id ) , link expiration with ( expiry )
    const currentTime = Math.floor(Date.now() / 1000);
    if (expiry && currentTime > expiry) return next(new ApiError(400, "Reset Password Link has been Expired"));

    // find user by ( id & rp_token ) 
    const user = await User.findOne({ _id: id, rp_token: { $elemMatch: { $eq: rp_token } } });

    if (!user) return next(new ApiError(404, "User Not Found"));

    // render newPasswordPage with ( id ) 
    return res
        .status(200)
        .json(
            new ApiResponse(true, "Enter your New Password", { id: user._id })
        )
});

const setNewPassword = wrapAsync(async (req, res, next) => {
    // get ( id , password ) from frontend
    const { id, newPassword } = req.body;

    // find the user by ( id ) 
    const user = await User.findById(id);

    if (!user) return next(new ApiError(404, "User Not Found"));

    // set user new password
    user.password = await newPassword;
    user.rp_token = [];

    const updatedUser = await user.save();

    // remove password - from response
    const updatedPasswordUser = await User.findById(updatedUser._id).select("-password -rp_token -token")

    // return response
    return res
        .status(200)
        .json(
            new ApiResponse(true, "Password Change Successfully", updatedPasswordUser)
        )
});


// Secure Controller's
const userSetProfilePage = wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("-password -rp_token -token");

    if (!user) return next(new ApiError(404, "User Not Found"));

    return res
        .status(200)
        .json(
            new ApiResponse(true, "User profile updation page", user)
        )
});


const userSetProfile = wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) return next(new ApiError(404, "User Not Found"));

    const { firstName, lastName, country, gender } = req.body;
    
    if (firstName) {
        const randomUsername = crypto.randomBytes(3).readUIntBE(0, 3).toString().padStart(5, '0');
        user.firstName = firstName;
        user.username = `${firstName}_${randomUsername}`;
    }
    if (lastName) user.lastName = lastName;

    user.fullName = (firstName || user.firstName) + ' ' + (lastName || user.lastName);
    user.country = (country || user.country);
    user.gender = (gender || user.gender);
    user.profileImage = (req.file?.path || user.profileImage);


    const updatedUser = await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(true, "User Profile Updated", updatedUser)
        )
});


const userProfile = wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("-password -rp_token -token");

    if (!user) return next(new ApiError(404, "User Not Found"));

    return res
        .status(200)
        .json(
            new ApiResponse(true, "User Profile Detail", user)
        )
});


export {
    registerPage,
    Register,
    loginPage,
    Login,
    verifyMail,
    resetPasswordPage,
    resetPassword,
    resetPasswordLinkVerification,
    setNewPassword,
    // secure controllers
    Logout,
    userSetProfilePage,
    userSetProfile,
    userProfile
}