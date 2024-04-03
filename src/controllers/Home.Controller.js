import User from "../models/User.Model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import wrapAsync from "../utils/wrapAsync.js";



// Dashboard Page 
const dashboard = wrapAsync(async (req, res, next) => {

    // Only get ( seaCoins , miningPower , miningStatus , activeReferredUsers or Active Network )
    const user = await User.findById(req.user?.id).select("-firstName -lastName -username -fullName -email -password -is_verified -rp_otp -otp -role -profileImage -gender -country -seaPearl -referredBy -referredCode -lastMiningTime -createdAt -updatedAt");

    if (!user) return next(new ApiError(404, "User Not Found"));

    let activeReferredUsers = 0;

    if (user.directReferred.length > 0) {

        await Promise.all(user.directReferred.map(async (directReferredCode) => {
            const directReferredUser = await User.findOne({ referredBy: directReferredCode });

            if (directReferredUser) {
                if (directReferredUser.is_verified) {
                    if (directReferredUser.miningStatus) {
                        activeReferredUsers += activeReferredUsers + 1
                    }
                }
            }
        }));

        if (user.indirectReferred.length > 0) {

            await Promise.all(user.indirectReferred.map(async (indirectReferredCode) => {
                const indirectReferredUser = await User.findOne({ referredBy: indirectReferredCode });

                if (indirectReferredUser) {
                    if (indirectReferredUser.is_verified) {
                        if (indirectReferredUser.miningStatus) {
                            activeReferredUsers += activeReferredUsers + 1
                        }
                    }
                }
            }));
        }

    }

    const { seaCoin, milestone, miningStatus, miningPower } = user;

    return res
        .status(200)
        .json(
            new ApiResponse(
                true,
                "User Dashboard",
                {
                    seaCoin: seaCoin,
                    milestone: milestone,
                    miningStatus: miningStatus,
                    miningPower: miningPower,
                    activeNetwork: activeReferredUsers
                }
            )
        )

});


// Teams ( Total Members ( direct + indirect Referred ) direct-members)
const teams = wrapAsync(async (req, res, next) => {

    const user = await User.findById(req.user?.id);

    if (!user) return next(new ApiError(404, "User Not Found"));

    let totalDirectReferred;
    let totalDirectAndIndirectReferred;
    let directAndIndirectReferredUsersNames = [];

    if (user.directReferred) {
        totalDirectReferred = user.directReferred.length;
        if (user.indirectReferred) {
            totalDirectAndIndirectReferred = (user.directReferred.length + user.indirectReferred.length)

            await Promise.all(user.directReferred.map(async (directReferredCode) => {
                const directReferredUser = await User.findOne({ referredBy: directReferredCode });
                if (directReferredUser) {
                    directAndIndirectReferredUsersNames.push({
                        userName: directReferredUser.username,
                        referred: "Direct",
                        miningStatus: directReferredUser.miningStatus
                    });
                }
            }));

            await Promise.all(user.indirectReferred.map(async (indirectReferredCode) => {
                const indirectReferredUser = await User.findOne({ referredCode: indirectReferredCode });
                if (indirectReferredUser) {
                    directAndIndirectReferredUsersNames.push({
                        userName: indirectReferredUser.username,
                        referred: "Indirect",
                        miningStatus: indirectReferredUser.miningStatus
                    });
                }
            }));
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                true,
                "User Direct & Indirect Members with Names",
                {
                    totalDirectReferredUser: totalDirectReferred,
                    totalDirectAndIndirectReferredUser: totalDirectAndIndirectReferred,
                    totalDirectAndIndirectReferredUsersNames: directAndIndirectReferredUsersNames
                }
            )
        )

});


// Changing Mining Status & Increment seaCoins
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
        }).select("-firstName -lastName -password -is_verified -rp_otp -otp -role -profileImage -gender -country -seaPearl -referredBy -referredCode -directReferrred -indirectReferred -createdAt -updatedAt");

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
                await Promise.all(user.directReferred.map(async (directReferredCode) => {
                    const verifyDirectReferredUser = await User.findOne({ referredCode: directReferredCode });
                    if (verifyDirectReferredUser) {
                        if (verifyDirectReferredUser.is_verified) {
                            if (verifyDirectReferredUser.miningStatus) {
                                incrementPointLevel += incrementPointLevel * 1.03;
                            }
                        }
                    }

                }))


                // Indirect Referred Increment
                if (user.indirectReferred.length > 0) {

                    // Interating Indirect Referred Users
                    await Promise.all(user.indirectReferred.map(async (indirectReferredCode) => {
                        const verifyIndirectReferrerdUser = await User.findOne({ referredCode: indirectReferredCode });
                        if (verifyIndirectReferrerdUser) {
                            if (verifyIndirectReferrerdUser.is_verified) {
                                if (verifyIndirectReferrerdUser.miningStatus) {
                                    incrementPointLevel += incrementPointLevel * 0.7
                                }
                            }
                        }

                    }))
                }

            }

        }

        await User.findByIdAndUpdate(
            { _id: req.user?.id },
            {
                $set: {
                    miningStatus: false,
                    lastMiningTime: 0,
                    miningPower: incrementPointLevel,
                },
                $inc: {
                    seaCoin: incrementPointLevel
                }
            })
        // .select("-firstName -lastName -password -is_verified -rp_otp -otp -role -gender -country -seaPearl -referredBy -directReferred -indirectReferred -createdAt -updatedAt -username -milestone -_id -indirectReffered -__v");

    }, 10000) // 12 * 60 * 60 * 1000 = 12 hours &  60 * 1000 = 1 minute

    // return response with updatedUser
    return res
        .status(200)
        .json(
            new ApiResponse(true, "Mining Started , you can mine once the current mine will be completed", {})
        )
});


const leaderBoard = wrapAsync(async (_, res, next) => {

    // Top 3 Users on Leader-Board
    const topThreeUsers = await User.aggregate([
        {
            $match: {
                seaCoin: { $gt: 0 }
            }
        },
        {
            $group: {
                _id: "$seaCoin",
                users: {
                    $push: "$$ROOT"
                }
            }
        },
        {
            $sort: {
                _id: -1
            }
        },
        {
            $limit: 3 // Limit apply on group not nested documents
        }
    ]);


    return res
        .status(200)
        .json(
            new ApiResponse(true, "Top 3 Users", topThreeUsers[0]) // [0] = All documents in [0] group
        )

});

const generateReferrelURL = wrapAsync(async (req, res, next) => {

    const user = await User.findById(req.user?.id);

    const referrelURL = `${process.env.SERVER_URL}/api/v1/users/register?referredCode=${user.referredCode}`;

    return res
        .status(201)
        .json(
            new ApiResponse(true, "Referrel URL Generated", referrelURL)
        )
});


export {
    tapMining,
    leaderBoard,
    generateReferrelURL,
    dashboard,
    teams
}

