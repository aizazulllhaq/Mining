import express from 'express'
import ApiError from './utils/ApiError.js';
// import cookieParser from 'cookie-parser';
import { checkForAuthentication, restrictFromSecureRotues } from './middlewares/Auth.Middleware.js'
import session from 'express-session'
import passport from 'passport'
import MongoStore from 'connect-mongo'
import passportConfiguration from './config/passport-google.js';


const app = express();


// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());

// passportjs setup with session
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_ATLAS_URL, collectionName: "session" }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));
// require('./config/passport');
passportConfiguration();
app.use(passport.initialize());
app.use(passport.session());

app.use(checkForAuthentication);



// Routes
import UserRouter from './routes/User.Routes.js';
import userSecureRouter from './routes/User.Secure.Routes.js';
import homeRouter from './routes/Home.Routes.js';
import userOauthRouter from './routes/userOauth.Routes.js';



app.use("/api/v1/users", UserRouter);
app.use("/dashboard/profile", restrictFromSecureRotues(["USER", "ADMIN"]), userSecureRouter);
app.use("/dashboard", restrictFromSecureRotues(["USER", "ADMIN"]), homeRouter);
app.use("/",userOauthRouter);



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