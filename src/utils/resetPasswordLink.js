import nodemailer from 'nodemailer'


const SendResetPasswordOTP = (userEmail, OTP) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        reuireTLS: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GMAIL_SMTP_PASS
        },
        connectionTimeout: 60000
    });


    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "Reset Password OTP",
        html: `Dear User,<br>
        <br>
        We received a request to reset your password for your account with xyz.com. To proceed with the password reset, please use the following One-Time Password (OTP):<br>
        <br>
        OTP: ${OTP}<br>
        <br>
        Please enter this OTP in the password reset form to set a new password for your account. This OTP is valid for a limited time only.<br>
        <br>
        If you did not request this password reset or have any concerns about your account security, please ignore this email or contact our support team immediately.<br>
        <br>
        Thank you for choosing xyz.com.<br>
        <br>
        Best regards,<br>
        xyz.com Team`
    };


    transporter.sendMail(mailOptions, (err, info) => {
        if (err) return console.log("Error Occured while Sending Mail :: ", err);

        return console.log("Email) has been send : ", info.response)
    })
}

export { SendResetPasswordOTP };