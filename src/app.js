import express from 'express'
import ApiError from './utils/ApiError.js';
import { checkForAuthentication } from './middlewares/Auth.Middleware.js'

const app = express();

// app.get('/', (req, res) => {
//     res.status(200).json(new ApiResponse(true, "some Data", "some message"))
// })

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(checkForAuthentication);


// Routes
import userRegisterRouter from './routes/UserRegister.Routes.js';
// import { restrictFromSecureRotues } from './middlewares/Auth.Middleware.js';

app.use("/api/v1/users", userRegisterRouter);
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