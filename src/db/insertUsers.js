import { connect } from "mongoose";
import User from "../models/User.Model.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function main() {
    try {
        // Connect to MongoDB
        await connect("mongodb://127.0.0.1:27017/Mining_1");

        // Generate hashed passwords for all users
        const usersWithHashedPasswords = await Promise.all(usersForTesting.map(async (user) => {
            const hashPassword = await bcrypt.hash(user.password, 10);
            const fullName = `${user.firstName} ${user.lastName}`;

            const randomUsername = crypto.randomBytes(3).readUIntBE(0, 3).toString().padStart(5, '0');
            const username = `${user.firstName}_${randomUsername}`

            const randomReferredCode = crypto.randomBytes(3).readUIntBE(0, 3).toString().padStart(8, '0');

            return {
                ...user,
                password: hashPassword,
                fullName,
                userName: username,
                referredCode: randomReferredCode,
                is_verified: true,
                role: "USER",
                gender: "Male",
                country: "Palestine"
            };
        }));

        // Insert users in batches
        const batchSize = 20;
        for (let i = 0; i < usersWithHashedPasswords.length; i += batchSize) {
            const batch = usersWithHashedPasswords.slice(i, i + batchSize);
            // console.log(batch) // Contain Users Array of Objects 
            await User.insertMany(batch);
        }

        console.log(`${usersForTesting.length} Users Inserted For Testing`);
        process.exit(0);
    } catch (err) {
        console.error("Error occurred while inserting users:", err.message);
        process.exit(1);
    }
}

main();
