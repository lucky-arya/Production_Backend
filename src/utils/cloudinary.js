import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })
    console.log("Cloudinary configured successfully! Cloud name:", process.env.CLOUDINARY_CLOUD_NAME)
    
}

export const uploadOnCloudinary = async (localfilePath) => {
    try {
        // Configure cloudinary on first use (after dotenv is loaded)
        if (!cloudinary.config().cloud_name) {
            configureCloudinary()
        }
        
        if (!fs.existsSync(localfilePath)) {
            throw new Error("File Path not found")
        }
        const result = await cloudinary.uploader.upload(localfilePath, {
            resource_type: "auto"
        })
        // file has been uploaded to cloudinary successfully, now we can remove it from local storage (optional)
        console.log("File uploaded to Cloudinary successfully:", result.secure_url)
        fs.unlinkSync(localfilePath)
        return result
    } catch (error) {
        if (fs.existsSync(localfilePath)) {
            fs.unlinkSync(localfilePath)
        }
        throw error
    }
}