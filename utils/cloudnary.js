import { v2 as cloudnary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudnary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});





const uploadOnCloudinary = async (localFilePath, resourceType = "auto") => {
    try {
        if (!localFilePath) {
            throw new Error("File path is required");
        }
        const response = await cloudnary.uploader.upload(localFilePath, {
            resource_type: resourceType,
        });
        //console.log("Cloudinary upload result:", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    }


    catch (error) {
        console.error("Cloudinary error:", error);
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch { }
        return null;
    }
};






export { uploadOnCloudinary };