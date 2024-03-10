import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userRegisterSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, "Email is Required"],
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    is_verified: {
        type: Boolean,
        default: false,
    },
    rp_token: [
        {
            type: String,
        }
    ],
    token: {
        type: String,
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    }
}, {
    timestamps: true
});

userRegisterSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10); // return hash-password

    next();
});

userRegisterSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
    // return -> true , false
}

userRegisterSchema.methods.generateAccessToken = async function () {

    const payload = {
        id: this._id,
        email: this.email,
        is_verified: this.is_verified,
        role: this.role
    }

    const token = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        });

    return token;
}


const UserRegister = model("UserRegister", userRegisterSchema);

export default UserRegister;