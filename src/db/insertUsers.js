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
}, {
    "firstName": "Cart",
    "lastName": "Girth",
    "country": "China",
    "email": "cgirtha@bing.com",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/248x100.png/dddddd/000000",
    "password": "Temp"
}, {
    "firstName": "Vernen",
    "lastName": "Surmeyers",
    "country": "Jordan",
    "email": "vsurmeyersb@washington.edu",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/153x100.png/ff4444/ffffff",
    "password": "Bitchip"
}, {
    "firstName": "Tome",
    "lastName": "Philot",
    "country": "China",
    "email": "tphilotc@rambler.ru",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/155x100.png/cc0000/ffffff",
    "password": "Biodex"
}, {
    "firstName": "Emlynne",
    "lastName": "Attenborough",
    "country": "Kenya",
    "email": "eattenboroughd@mozilla.org",
    "gender": "Female",
    "profileImage": "http://dummyimage.com/195x100.png/ff4444/ffffff",
    "password": "Home Ing"
}, {
    "firstName": "Pris",
    "lastName": "Passfield",
    "country": "Sri Lanka",
    "email": "ppassfielde@nps.gov",
    "gender": "Female",
    "profileImage": "http://dummyimage.com/122x100.png/dddddd/000000",
    "password": "Tin"
}, {
    "firstName": "Caresa",
    "lastName": "Gonzales",
    "country": "Indonesia",
    "email": "cgonzalesf@dropbox.com",
    "gender": "Female",
    "profileImage": "http://dummyimage.com/160x100.png/cc0000/ffffff",
    "password": "Gembucket"
}, {
    "firstName": "Kiel",
    "lastName": "Tsarovic",
    "country": "Philippines",
    "email": "ktsarovicg@goo.gl",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/218x100.png/dddddd/000000",
    "password": "Alpha"
}, {
    "firstName": "Antonino",
    "lastName": "Dimmne",
    "country": "France",
    "email": "adimmneh@furl.net",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/226x100.png/cc0000/ffffff",
    "password": "Otcom"
}, {
    "firstName": "Benji",
    "lastName": "Brownbridge",
    "country": "Cameroon",
    "email": "bbrownbridgei@booking.com",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/231x100.png/5fa2dd/ffffff",
    "password": "Latlux"
}, {
    "firstName": "Georgetta",
    "lastName": "Bairstow",
    "country": "Honduras",
    "email": "gbairstowj@live.com",
    "gender": "Female",
    "profileImage": "http://dummyimage.com/148x100.png/dddddd/000000",
    "password": "Pannier"
}, {
    "firstName": "Erek",
    "lastName": "Zelland",
    "country": "Guinea",
    "email": "ezellandk@hp.com",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/244x100.png/5fa2dd/ffffff",
    "password": "Asoka"
}, {
    "firstName": "Danice",
    "lastName": "Keddle",
    "country": "Indonesia",
    "email": "dkeddlel@latimes.com",
    "gender": "Female",
    "profileImage": "http://dummyimage.com/113x100.png/dddddd/000000",
    "password": "Tin"
}, {
    "firstName": "Farrel",
    "lastName": "Kays",
    "country": "Myanmar",
    "email": "fkaysm@cafepress.com",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/105x100.png/cc0000/ffffff",
    "password": "Cardify"
}, {
    "firstName": "Boote",
    "lastName": "Ferrarini",
    "country": "Cayman Islands",
    "email": "bferrarinin@indiegogo.com",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/242x100.png/dddddd/000000",
    "password": "Domainer"
}, {
    "firstName": "Richmond",
    "lastName": "Hammerberger",
    "country": "Russia",
    "email": "rhammerbergero@altervista.org",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/236x100.png/5fa2dd/ffffff",
    "password": "Toughjoyfax"
}, {
    "firstName": "Irwinn",
    "lastName": "Beszant",
    "country": "Japan",
    "email": "ibeszantp@printfriendly.com",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/167x100.png/cc0000/ffffff",
    "password": "Zoolab"
}, {
    "firstName": "Ainsley",
    "lastName": "Lomb",
    "country": "Azerbaijan",
    "email": "alombq@comcast.net",
    "gender": "Female",
    "profileImage": "http://dummyimage.com/178x100.png/5fa2dd/ffffff",
    "password": "Keylex"
}, {
    "firstName": "Chas",
    "lastName": "McFadin",
    "country": "Mexico",
    "email": "cmcfadinr@google.cn",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/122x100.png/ff4444/ffffff",
    "password": "Y-find"
}, {
    "firstName": "Carmine",
    "lastName": "Freckingham",
    "country": "Pakistan",
    "email": "cfreckinghams@edublogs.org",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/169x100.png/cc0000/ffffff",
    "password": "Veribet"
}, {
    "firstName": "Jecho",
    "lastName": "Fordyce",
    "country": "Indonesia",
    "email": "jfordycet@google.com",
    "gender": "Male",
    "profileImage": "http://dummyimage.com/207x100.png/dddddd/000000",
    "password": "Stronghold"
}];

async function main() {
    try {
        // Connect to MongoDB
        // await connect(process.env.MONGO_ATLAS_URL);

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
            await User.deleteMany({});
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