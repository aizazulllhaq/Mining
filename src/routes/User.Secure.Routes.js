import { Router } from "express";
import { userSetProfile, userSetProfilePage, userProfile } from "../controllers/User.Controller.js";
import { upload } from "../middlewares/Multer.Middleware.js";

const userSecureRouter = Router();

userSecureRouter.route("/set-profile") // Edit or Update Profile
    .get(userSetProfilePage)
    .post(upload.single("profileImage"), userSetProfile)

userSecureRouter.get("/profile", userProfile)


export default userSecureRouter;