import nodemailer from "nodemailer";
import cron from 'node-cron';
import User from "../models/User.Model.js";

const sendMailToUser = (userEmail) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GMAIL_SMTP_PASS,
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "Shining Star",
        html: `<h1>Congrats !! your have More Coins then other Users !! you win the prize</h1>`
    }

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log("Shining Star Mail sent : ", info.response);
        }
    })
}

export const fetchUserWhichHaveMoreCoins = () => {

    // Run At Every Monday in A week
    cron.schedule("0 0 * * 1", async function () {

        console.log("every 10 seconds after")
        const topUserWithMoreCoins = await User.aggregate([
            {
                $sort: {
                    seaCoin: -1
                }
            },
            {
                $limit: 1
            },
            {
                $project: {
                    email: 1,
                    _id: 0
                }
            }
        ]);

        if (topUserWithMoreCoins) {

            sendMailToUser(topUserWithMoreCoins[0].email);

        }

    })

}