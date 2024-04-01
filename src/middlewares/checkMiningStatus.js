import User from "../models/User.Model.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const checkMiningStatus = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) return next(new ApiError(404, "User Not Found"));

    if (user.miningStatus) {
        const currentTime = Date.now();

        const lastMiningTime = user.lastMiningTime || currentTime;

        const timeDifference = currentTime - lastMiningTime;
        const hoursDifference = timeDifference / (1000 * 60 * 60);

        if (hoursDifference < 12) {
            const remainingHours = 12 - hoursDifference;
            return res
                .status(200)
                .json(
                    new ApiResponse(true, `Cannot mine yet. try again after ${remainingHours.toFixed(2)} hours`)
                )
        }
    }
    next();
}

export {
    checkMiningStatus
}