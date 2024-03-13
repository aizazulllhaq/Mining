import { Router } from "express";
import { Login, Logout, Register, loginPage, registerPage, resetPassword, resetPasswordLinkVerification, resetPasswordPage, setNewPassword, verifyMail } from "../controllers/User.Controller.js";
import { restrictFromSecureRotues } from "../middlewares/Auth.Middleware.js";

const UserRouter = Router();

UserRouter.route("/register")
    .get(registerPage)
    .post(Register);

UserRouter.route("/verify").get(verifyMail)

UserRouter.route("/login")
    .get(loginPage)
    .post(Login);


UserRouter.route("/resetPassword")
    .get(resetPasswordPage)
    .post(resetPassword)

UserRouter.route("/newPassword")
    .get(resetPasswordLinkVerification)
    .post(setNewPassword)



// Secure Routes

UserRouter.get("/logout", restrictFromSecureRotues(["USER", "ADMIN"]), Logout)


export default UserRouter;