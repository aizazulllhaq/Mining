import express from 'express'
import ApiError from './utils/ApiError.js';
import cookieParser from 'cookie-parser';
import { checkForAuthentication, restrictFromSecureRotues } from './middlewares/Auth.Middleware.js'


const app = express();


// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthentication);



// Routes
import UserRouter from './routes/User.Routes.js';
import userSecureRouter from './routes/User.Secure.Routes.js';



app.use("/api/v1/users", UserRouter);
app.use("/dashboard", restrictFromSecureRotues(["USER", "ADMIN"]), userSecureRouter);
// app.use("/dashboard", restrictFromSecureRotues(["USER", "ADMIN"]), dashboardRouter);



// Pages which Doesn't Exists
app.use("*", (req, res, next) => {
    next(new ApiError(404, "Page Not Found"));
});


// Error Handling
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Some Error Occured" } = err;
    res.status(statusCode).json({ message })
});

export default app