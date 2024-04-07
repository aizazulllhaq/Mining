import { connect } from "mongoose";
import User from "../models/User.Model.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const usersForTesting = [{
    "firstName": "Leighton",
    "lastName": "Brettel",
    "country": "France",
    "email": "lbrettel0@stanford.edu",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/228x100.png/cc0000/ffffff",
    "password": "Kanlam"
}, {
    "firstName": "Angil",
    "lastName": "Natte",
    "country": "Mozambique",
    "email": "anatte1@bluehost.com",
    "gender": "Female",
    "profileImage": "http://dummyimage.com/122x100.png/ff4444/ffffff",
    "password": "Tresom"
}, {
    "firstName": "Morse",
    "lastName": "Ballinghall",
    "country": "Brazil",
    "email": "mballinghall2@cam.ac.uk",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/196x100.png/5fa2dd/ffffff",
    "password": "Stringtough"
}, {
    "firstName": "Ambrosio",
    "lastName": "Hardware",
    "country": "Portugal",
    "email": "ahardware3@last.fm",
    "gender": "Non-binary",
    "profileImage": "http://dummyimage.com/158x100.png/ff4444/ffffff",
    "password": "Bamity"
}, {
    "firstName": "Jan",
    "lastName": "Redhouse",
    "country": "Portugal",
    "email": "jredhouse4@msu.edu",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/203x100.png/dddddd/000000",
    "password": "Stringtough"
}, {
    "firstName": "Biron",
    "lastName": "Scrancher",
    "country": "Philippines",
    "email": "bscrancher5@hp.com",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/166x100.png/cc0000/ffffff",
    "password": "Voltsillam"
}, {
    "firstName": "Jennine",
    "lastName": "Vasiltsov",
    "country": "Belize",
    "email": "jvasiltsov6@wikia.com",
    "gender": "Female",
    "profileImage": "http://dummyimage.com/156x100.png/cc0000/ffffff",
    "password": "Zaam-Dox"
}, {
    "firstName": "Marvin",
    "lastName": "De Andisie",
    "country": "Russia",
    "email": "mdeandisie7@dagondesign.com",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/238x100.png/5fa2dd/ffffff",
    "password": "Bytecard"
}, {
    "firstName": "Gay",
    "lastName": "Dingley",
    "country": "China",
    "email": "gdingley8@loc.gov",
    "gender": "Female",
    "profileImage": "http://dummyimage.com/119x100.png/cc0000/ffffff",
    "password": "Bamity"
}, {
    "firstName": "Algernon",
    "lastName": "Kelle",
    "country": "China",
    "email": "akelle9@wix.com",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/145x100.png/ff4444/ffffff",
    "password": "Biodex"
}];

// let usersForTesting = usersForTestingRough.filter((value, index, self) => self.indexOf(value.email) == index);

// console.log(`usersForTestingRough length : ${usersForTestingRough.length} , and usersForTesting length  : ${usersForTesting.length}`)

async function main() {
    try {
        // Connect to MongoDB
        // await connect(process.env.MONGO_ATLAS_URL);

        // Generate hashed passwords for all users
        await User.deleteMany({});
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

export default main;