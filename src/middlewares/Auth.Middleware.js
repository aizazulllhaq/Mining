import ApiError from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'

const checkForAuthentication = (req, _, next) => {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!user) return next(new ApiError(400, "Invalid accessToken"));

        req.user = user;

        next();

    } catch (err) {
        next(new ApiError(400, err.message));
    }

}

const restrictFromSecureRotues = (role = []) => {
    return (req, _, next) => {
        if (!req.user) return next(new ApiError(401, "Unauthorize Please First Login"));

        if (!req.user.is_verified) return next(new ApiError(400, "Please First Verify your Mail"));

        if (!role.includes(req.user.role)) return next(new ApiError(400, "Role Must be Present"));

        next();
    }
}


export { checkForAuthentication, restrictFromSecureRotues }