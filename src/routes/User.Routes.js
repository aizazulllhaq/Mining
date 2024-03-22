import { Router } from "express";
import {
    Login,
    Logout,
    getEmailToVerify,
    loginPage,
    getEmailPage,
    resetPassword,
    resetPasswordPage,
    verifyEmailAndSetUserDocument,
    verifyOTPAndSetNewPassword,
} from "../controllers/User.Controller.js";
import { restrictFromSecureRotues } from "../middlewares/Auth.Middleware.js";

const UserRouter = Router();

UserRouter.route("/register")
    .get(getEmailPage)
    .post(getEmailToVerify)

UserRouter.post("/register/verify-email", verifyEmailAndSetUserDocument)

UserRouter.route("/login")
    .get(loginPage)
    .post(Login);


UserRouter.route("/resetPassword")
    .get(resetPasswordPage)
    .post(resetPassword)

UserRouter.post("/newPassword", verifyOTPAndSetNewPassword);

// Secure Routes

UserRouter.get("/logout", restrictFromSecureRotues(["USER", "ADMIN"]), Logout)


export default UserRouter;