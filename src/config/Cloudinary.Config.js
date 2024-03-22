import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    debug: true
});

const uploadFileOnLocalAndCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("Response of uploading file on cloudinary : ", response);

        fs.unlinkSync(localFilePath);

        return response;

    } catch (err) {
        console.log("Error while uploading file : ", err.message)
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadFileOnLocalAndCloudinary }