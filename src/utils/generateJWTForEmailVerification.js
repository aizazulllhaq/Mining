import jwt from 'jsonwebtoken';

const generateJWTTokenForEmailVerification = (email) => {
    try {
        const token = jwt.sign({
            email,
        },
            process.env.ACCESS_TOKEN_SECRET
        )

        return token;
    } catch (err) {
        console.log("Error Occured while jwt : ", err.message);
    }
}

export default generateJWTTokenForEmailVerification;