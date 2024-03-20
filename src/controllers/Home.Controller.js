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
                // increment coins
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
                // console.log(user.directReferred)

                // Interating Direct Referred Users
                // NOTE !! map execute asyncronously , to wait for all the iteration we need to use ( await Promise.all )
                await Promise.all(user.directReferred.map(async (directReferredUser) => { 
                    // console.log("direct user interation ", directReferredUser)
                    const verifyDirectReferredUser = await User.findOne({ referredCode: directReferredUser });
                    console.log("verifyDirectUser : ", verifyDirectReferredUser)
                    if (verifyDirectReferredUser.is_verified) {
                        incrementPointLevel += incrementPointLevel * 1.03;
                        // console.log("increment point level direct referred user : ", incrementPointLevel)
                    }
                }))
            }
            else {
                console.log("No Direct-Referred Found");
            }

            // Indirect Referred Increment
            if (user.indirectReffered.length > 0) {
                // console.log(user.indirectReffered);

                // Interating Indirect Referred Users
                await Promise.all(user.indirectReffered.map(async (indirectReferredUser) => {
                    // console.log("indirect user interation", indirectReferredUser);

                    const verifyIndirectReferrerdUser = await User.findOne({ referredCode: indirectReferredUser });
                    console.log("verifyIndirectReferrerdUser : ", verifyIndirectReferrerdUser)
                    if (verifyIndirectReferrerdUser.is_verified) {
                        incrementPointLevel += incrementPointLevel * 0.7
                        // console.log("increment point level indirect referred user : ", incrementPointLevel)
                    }
                }))
            }
        }

        console.log("globally", incrementPointLevel)

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
    }, 10000) // 12 * 60 * 60 * 1000 = 12 hours &  60 * 1000 = 1 minute 

    // return response with updatedUser
    return res
        .status(200)
        .json(
            new ApiResponse(true, "Mining Started , you can mine after 12 hours", updatedUser)
        )
});



export {
    tapMining,
}