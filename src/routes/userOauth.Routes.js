import { Router } from "express";
import passport from "passport";

const userOauthRouter = Router();

userOauthRouter
    .get('/auth/google',
        passport.authenticate('google', { scope: ['email', 'profile'] }))
    // .get('/auth/google/callback',
    //     passport.authenticate('google', { failureRedirect: '/api/v1/users/login', successRedirect: "/dashboard/profile" }));
    .get("/auth/google/callback", (req, res, next) => {
        passport.authenticate("google", { session: false }, (err, { success, user, accessToken, msg }) => {
            if (err) {
                // Handle error
                return next(err);
            }
            if (!user) {
                // User not found
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ data: { success, user, accessToken, msg } })

        })(req, res, next);
    })



export default userOauthRouter;