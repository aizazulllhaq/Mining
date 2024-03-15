import { connect } from "mongoose";
import { DB_NAME } from "../constant.js";

const dbConnect = async () => {
    try {
        const connnectionInstance = await connect(`${process.env.MONGO_ATLAS_URL}/${DB_NAME}`);
        console.log("Mongo Connection with Host : ", connnectionInstance.connection.host);
    } catch (err) {
        console.log("Mongo Connection Failed !! ", err.message)
        process.exit(1);
    }
}

export default dbConnect;