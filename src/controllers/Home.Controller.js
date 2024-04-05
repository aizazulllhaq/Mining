import User from "../models/User.Model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import wrapAsync from "../utils/wrapAsync.js";



// Dashboard Page 
const dashboard = wrapAsync(async (req, res, next) => {

    // Only get ( seaCoins , miningPower , miningStatus , activeReferredUsers or Active Network )
    const user = await User.findById(req.user?.id).select("seaCoin milestone miningStatus lastMiningTime directReferred indirectReferred -_id");

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



    const { seaCoin, milestone, miningStatus, lastMiningTime } = user;


    return res
        .status(200)
        .json(
            new ApiResponse(
                true,
                "User Dashboard",
                {
                    seaCoin,
                    milestone,
                    miningStatus,
                    lastMiningTime
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

    // get user ( directReferred & indirectReferred ) and updating the user .
    const level1User = await User.findByIdAndUpdate(
        { _id: req.user?.id },
        {
            $set: {
                miningStatus: true,
                lastMiningTime: currentTime,
            }
        }).select("directReferred indirectReferred -_id miningPower");

    // checking the updatedUser Updation
    if (!level1User) return next(new ApiError(404, "User Not Found"));

    // change mining status to false , after 12 hours
    setTimeout(async () => {

        let incrementPointLevel = level1User.miningPower;

        // Direct Referred Increment
        if (level1User.directReferred.length > 0) {

            // Interating Direct Referred Users
            // NOTE !! map execute asyncronously , to wait for all the iteration we need to use ( await Promise.all )
            await Promise.all(level1User.directReferred.map(async (directReferredCode) => {
                const verifyDirectReferredUser = await User.findOne({ referredCode: directReferredCode });
                if (verifyDirectReferredUser) {
                    if (verifyDirectReferredUser.is_verified) {
                        if (verifyDirectReferredUser.miningStatus) {
                            incrementPointLevel *= 1.03;
                        }
                    }
                }
            }))

            // Indirect Referred Increment
            if (level1User.indirectReferred.length > 0) {

                // Interating Indirect Referred Users
                await Promise.all(level1User.indirectReferred.map(async (indirectReferredCode) => {
                    const verifyIndirectReferrerdUser = await User.findOne({ referredCode: indirectReferredCode });
                    if (verifyIndirectReferrerdUser) {
                        if (verifyIndirectReferrerdUser.is_verified) {
                            if (verifyIndirectReferrerdUser.miningStatus) {
                                incrementPointLevel *= 0.7
                            }
                        }
                    }
                }))
            }
        }


        await User.findByIdAndUpdate(
            { _id: req.user?.id },
            {
                $set: {
                    miningStatus: false,
                    lastMiningTime: 0,
                },
                $inc: {
                    seaCoin: incrementPointLevel
                }
            })
    }, 60000) // 12 * 60 * 60 * 1000 = 12 hours &  60 * 1000 = 1 minute

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


const useAnotherUserReferredCode = wrapAsync(async (req, res, next) => {

    const { referrelCode } = req.body;

    if (!referrelCode) return next(new ApiError(404, "Referrel Code Must be required"));

    const user = await User.findById(req.user?.id);

    if (!user) return next(new ApiError(404, "User Not Found"));

    const level1User = await User.findOne({ referredCode: referrelCode });

    if (!level1User) return next(new ApiError(400, "Invalid Referrel Code"));

    console.log(level1User)

    user.referredBy = referrelCode;

    level1User.directReferred.push(user.referredCode);

    await user.save();
    await level1User.save();

    if (level1User.referredBy) {

        const level0User = await User.findOne({ referredCode: level1User.referredBy });

        if (level0User) {

            level0User.indirectReferred.push(user.referredCode);

            await level0User.save();
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                true,
                "Referrel Code Added Successfully",
                {}
            )
        )
});


const onboardingPage = wrapAsync(async (req, res, next) => {

    const user = await User.findById(req.user?.id).select("phoneNumber firstName lastName country -_id");

    if (!user) return next(new ApiError(404, "User Not Found"));

    return res
        .status(200)
        .json(
            new ApiResponse(
                true,
                "Onboarding Page Data",
                user
            )
        )
});

const Onboarding = wrapAsync(async (req, res, next) => {
    const { phoneNumber, firstName, lastName, country } = req.body;

    const user = await User.findById(req.user?.id);

    if (!user) return next(new ApiError(404, "User Not Found"));

    if (phoneNumber) {
        user.phoneNumber = (phoneNumber || user.phoneNumber);
    }

    if (firstName) {
        user.firstName = (firstName || user.firstName);
    }

    if (lastName) {
        user.lastName = (lastName || user.lastName);
    }

    if (country) {
        user.country = (country || user.country);
    }

    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                true,
                "Onboarding Data Updated Successfully",
                {}
            )
        )
});


const sideMenu = wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.user?.id).select("profileImage fullName username -_id");

    if (!user) return next(new ApiError(404, "User Not Found"));

    return res
        .status(200)
        .json(
            new ApiResponse(
                true,
                "Side Menu User Data",
                user
            )
        )
});

export {
    tapMining,
    leaderBoard,
    generateReferrelURL,
    dashboard,
    teams,
    useAnotherUserReferredCode,
    onboardingPage,
    Onboarding,
    sideMenu
}

