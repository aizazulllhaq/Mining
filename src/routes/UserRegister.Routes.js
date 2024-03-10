import { Router } from "express";
import { Login, Logout, Register, loginPage, logoutPage, registerPage, resetPassword, resetPasswordLinkVerification, resetPasswordPage, setNewPassword, verifyMail } from "../controllers/UserRegister.Controller.js";

const userRegisterRouter = Router();

userRegisterRouter.route("/register")
    .get(registerPage)
    .post(Register);

userRegisterRouter.route("/login")
    .get(loginPage)
    .post(Login);


userRegisterRouter.route("/resetPassword")
    .get(resetPasswordPage)

userRegisterRouter.route("/newPassword")
    .get(resetPasswordLinkVerification)
    .post(setNewPassword)


userRegisterRouter.route("/verify").get(verifyMail)

userRegisterRouter.route("/logout")
    .get(logoutPage)
    .post(restrictFromSecureRotues, Logout)


export default userRegisterRouter;