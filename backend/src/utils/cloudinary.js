import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (localFilePath) => {

    try {

        if (!localFilePath) return null;

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded successfull
        // console.log("File is uploaded on cloudinary ", response.url);

        fs.unlinkSync(localFilePath);

        return response;


    } catch (error) {

        // remove the locally saved temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath);
        return null;

    }
}


const extractPublicIdFromUrl =  (fileUrl_Public_id) => {
    try {
        const pathParts = fileUrl_Public_id.split('/upload/');
        // console.log("pathParts ", pathParts);

        if (pathParts.length === 2) {
            // Split the second part by '/' and exclude the first component (version)
            const publicIdParts = pathParts[1].split('/').slice(1);
            // console.log("publicIdParts ", publicIdParts);

            // Remove file extension (.jpg)
            const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, '');
            console.log("publicId : ", publicId);

            return publicId;
        }
        return null;
    } catch (error) {
        return null;
    }
};



const deleteFromCloudinary = async (oldFileURL, fileType) => {

    try {
        // console.log(oldFileURL);


        if (!oldFileURL) {
            throw new ApiError(400, "File- url  is missing...")
        }

        const public_Id = extractPublicIdFromUrl(oldFileURL);
        // console.log(public_Id)

        const response = await cloudinary.uploader.destroy(public_Id, { resource_type: fileType });
        // console.log(response);

        if (response.result !== 'ok') {
            return false;
        }

        // If the deletion was successful on Cloudinary
        return true;


    } catch (error) {

        return false;

    }
}

export { uploadOnCloudinary, deleteFromCloudinary }




