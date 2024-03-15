import nodemailer from 'nodemailer'
import generateRandonToken from './generateRandomToken.js';
import { SERVER_URL } from '../constant.js';


const SendEmailVerificationLink = (userID, userEmail) => {
    console.log("sending mail");
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        reuireTLS: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GMAIL_SMTP_PASS
        }
    });

    const expiryTimestamp = Math.floor(Date.now() / 1000) + (24 * 60 * 60);// 24 hours from now 
    const randomToken = generateRandonToken();

    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "Subject: Verify Your Email Address",
        html: `Dear User,<br><br>
        Thank you for creating an account with xyz.com. To ensure the security of your account and activate its full functionality, we need to verify your email address.<br><br>
        
        Please follow the instructions below to verify your email:<br><br>
        
        - Click on the following link to verify your email address: <a href="${SERVER_URL}/api/v1/users/verify?id=${userID}&expiry=${expiryTimestamp}&token=${randomToken}">Verify Mail</a> (If the link doesn't work, please copy and paste it into your web browser's address bar.)<br>
        
        - You will be directed to a page confirming that your email address has been successfully verified.<br>
        
        - Once your email address is verified, you'll be able to access all features of your account and receive important updates from us.<br>
        
        - If you did not create an account with xyz.com, or if you believe this email was sent to you in error, please disregard it.<br>
        
        - Thank you for choosing [Your Company Name]. We look forward to serving you!<br>
        
        - Best regards,<br>
        - xyz.com Team`
    };


    transporter.sendMail(mailOptions, (err, info) => {
        if (err) return console.log("Error Occured while Sending Mail :: ", err);

        return console.log("Email has been send : ", info.response);
    })
}

export { SendEmailVerificationLink };