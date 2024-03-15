import User from "../models/User.Model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import wrapAsync from "../utils/wrapAsync.js";

const startMining = wrapAsync(async (req, res, next) => {
    // creating current timestamp , to check in again mining time is the mining 12 hours completed or Not
    const currentTime = Date.now();

    // updating the user .
    const updatedUser = await User.findByIdAndUpdate(
        { _id: req.user.id },
        {
            $set: {
                miningStatus: true,
                lastMiningTime: currentTime,
                // increment coins
            }
        });

    // checking the updatedUser Updation
    if (!updatedUser) return next(new ApiError(404, "User Not Found"));

    // change mining status to false , after 12 hours
    setTimeout(async () => {
        await User.findByIdAndUpdate(
            { _id: req.user.id },
            {
                $set: {
                    miningStatus: false
                }
            });
        console.log("Mining Status Reset after 12 hours");
    }, 12 * 60 * 60 * 1000)

    // return response with updatedUser
    return res
        .status(200)
        .json(
            new ApiResponse(true, "Mining Started , you can mine after 12 hours", updatedUser)
        )
});



export {
    startMining,
}