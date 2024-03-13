import dotenv from 'dotenv';
import dbConnect from './db/dbConnection.js';
import app from './app.js';
import { SERVER_URL } from './constant.js';

dotenv.config({
    path: "./.env",
});

// Database Connection , if db Connect successfull , then starting the Express App/Server
dbConnect().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server started on ${SERVER_URL}`);
    });
}).catch((err) => {
    console.log(err)
})