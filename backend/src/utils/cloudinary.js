import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadImage = async (localFile) => {
    try {
        if (!localFile) return null;

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });

        const result = await cloudinary.uploader.upload(localFile, {
            resource_type: 'auto',
        });

        fs.unlinkSync(localFile)
        return result;

    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        fs.unlinkSync(localFile)
        return null;
    }
}

export default uploadImage;
