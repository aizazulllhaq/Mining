import passport from "passport"
import GoogleStrategy from "passport-google-oauth2"
import crypto from "crypto";
import User from "../models/User.Model.js";

const passportConfiguration = () => {

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
        passReqToCallback: true,
    },

        async function (request, accessToken, refreshToken, profile, done) {
            const user = await User.findOne({ googleId: profile.id });

            if (!user) {
                const { id, email, picture } = profile;
                const newUser = new User({
                    googleId: id,
                    email,
                    profileImage: picture,
                    is_verified:true
                });

                // After the above validation when everything is Clear
                const randomReferredCode = crypto.randomBytes(3).readUIntBE(0, 3).toString().padStart(8, '0');
                newUser.referredCode = randomReferredCode;

                await newUser.save();

                const accessToken = await newUser.generateAccessToken();

                return done(null, { user: newUser, accessToken, msg: "new user created", success: true });
            }
            else {
                return done(null, { user: user, accessToken, msg: "user already exists with this email.", success: true })
            }
        }
    ));
}

export default passportConfiguration;