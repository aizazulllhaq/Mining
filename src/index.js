import dotenv from 'dotenv';
import dbConnect from './db/dbConnection.js';
import app from './app.js';
import main from './db/insertUsers.js';

dotenv.config({
    path: "./.env",
});

// Database Connection , if db Connect successfull , then starting the Express App/Server
dbConnect().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server started on ${process.env.SERVER_URL}`);
    });
}).catch((err) => {
    console.log(err)
});

setTimeout(() => {
    main();
}, 5000);
