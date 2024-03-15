import nodemailer from 'nodemailer';
import generateRandonToken from './generateRandomToken.js';
import User from '../models/User.Model.js';
import { SERVER_URL } from '../constant.js';

const sendResetPasswordLink = async (userID, userEmail) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GMAIL_SMTP_PASS,
        },
        connectionTimeout: 60000,
    });

    const expiryTimestamp = Math.floor(Date.now() / 1000 + (24 * 60 * 60));
    const randomToken = generateRandonToken();

    const user = await User.findById(userID);
    user.rp_token.push(randomToken);

    await user.save({ validateBeforeSave: false });

    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "Subject: Password Reset Request",
        html: `Dear User,<br><br>
        - We have received a request to reset the password associated with your account. To proceed with the password reset process, please follow the instructions below:<br><br>
    
        - Click on the following link to reset your password: <a href="${SERVER_URL}/api/v1/users/newPassword?id=${userID}&expiry=${expiryTimestamp}&rp_token=${randomToken}">Reset Password</a> (If the link doesn't work, please copy and paste it into your web browser's address bar.)<br>
    
        - You will be directed to a page where you can set a new password for your account.<br>
        
        - Once you have set your new password, you will be able to log in using your updated credentials.<br>
    
        - If you did not initiate this password reset request or believe it was sent to you in error, please disregard this email. Your account security is important to us, and we recommend taking measures to secure your account if you suspect any unauthorized access.<br>
    
        Thank you for your attention to this matter.<br>
        
        Best regards,<br>
        xyz.com Team`
    };


    transporter.sendMail(mailOptions, (err, info) => {
        if (err) return console.log("Error Occured While Sending Mail :: ", err);

        return console.log("Email has been sent :", info.response);
    })
}

export default sendResetPasswordLink;