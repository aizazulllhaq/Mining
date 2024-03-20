import User from "../models/User.Model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import wrapAsync from "../utils/wrapAsync.js";

const tapMining = wrapAsync(async (req, res, next) => {
    // creating current timestamp , to check in again mining time is the mining 12 hours completed or Not
    const currentTime = Date.now();

    // updating the user .
    const updatedUser = await User.findByIdAndUpdate(
        { _id: req.user?.id },
        {
            $set: {
                miningStatus: true,
                lastMiningTime: currentTime,
            }
        }).select("-password -token -rp_token -_id");

    // checking the updatedUser Updation
    if (!updatedUser) return next(new ApiError(404, "User Not Found"));

    // change mining status to false , after 12 hours
    setTimeout(async () => {

        let incrementPointLevel = 1.03;

        // Direct Referred Increment
        const user = await User.findById(req.user?.id);
        if (user) {
            if (user.directReferred.length > 0) {

                // Interating Direct Referred Users
                // NOTE !! map execute asyncronously , to wait for all the iteration we need to use ( await Promise.all )
                await Promise.all(user.directReferred.map(async (directReferredUser) => {
                    const verifyDirectReferredUser = await User.findOne({ referredCode: directReferredUser });
                    console.log("verifyDirectUser : ", verifyDirectReferredUser)
                    if (verifyDirectReferredUser.is_verified) {
                        incrementPointLevel += incrementPointLevel * 1.03;
                    }
                }))
            }

            // Indirect Referred Increment
            if (user.indirectReffered.length > 0) {

                // Interating Indirect Referred Users
                await Promise.all(user.indirectReffered.map(async (indirectReferredUser) => {
                    const verifyIndirectReferrerdUser = await User.findOne({ referredCode: indirectReferredUser });
                    if (verifyIndirectReferrerdUser.is_verified) {
                        incrementPointLevel += incrementPointLevel * 0.7
                    }
                }))
            }
        }

        await User.findByIdAndUpdate(
            { _id: req.user?.id },
            {
                $set: {
                    miningStatus: false,
                    lastMiningTime: 0
                },
                $inc: {
                    seaCoin: incrementPointLevel
                }
            });
        console.log("Mining Status Reset after 12 hours");
    }, 12 * 60 * 60 * 1000) // 12 * 60 * 60 * 1000 = 12 hours &  60 * 1000 = 1 minute 

    // return response with updatedUser
    return res
        .status(200)
        .json(
            new ApiResponse(true, "Mining Started , you can mine after 12 hours", updatedUser)
        )
});


const leaderBoard = wrapAsync(async (req, res, next) => {

    // Top 3 Users on Leader-Board
    return res
    .status(200)
    .json(
        new ApiResponse(true,"Top 3 Users",{})
    )

});

const generateReferrelURL = wrapAsync(async (req, res, next) => {

    const user = await User.findById(req.user?.id);

    const referrelURL = `${process.env.SERVER_URL}/api/v1/users/register?referredCode=${user.referredCode}`;
    console.log(referrelURL)

    return res
        .status(201)
        .json(
            new ApiResponse(true, "Referrel URL Generated", referrelURL)
        )
});


export {
    tapMining,
    leaderBoard,
    generateReferrelURL
}