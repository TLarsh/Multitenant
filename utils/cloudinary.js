const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv')
dotenv.config()

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET,
});

const cloudinaryUploadImg = async (fileToUploads) => {
    return new Promise ((resolve) => {
        cloudinary.uploader.upload(fileToUploads, (result) => {
            resolve(
                {
                    url: result.secure_url,
                },
                {
                    resource_type: "auto",
                }
            );
        });
    });
};



module.exports = {cloudinary, cloudinaryUploadImg};