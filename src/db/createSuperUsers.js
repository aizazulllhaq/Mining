import { connect } from "mongoose";
import User from "../models/User.Model.js";


main()
    .then(() => console.log("db connected"))
    .catch((err) => console.log(err))

async function main() {
    await connect("mongodb://127.0.0.1:27017/Mining_1")
}


const superUser = async () => {
    await User.deleteMany({})
    const superUser = await User.insertMany([{
        firstName: "Super",
        lastName: "User",
        email: "superUser@gmail.com",
        is_verified: true,
        referredBy: 111111,
        referredCode: 222222,
    }]);

    console.log(superUser)
}

superUser();