import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const cloudinaryUpload= async (localFile)=>{
  try {
    const response=await cloudinary.uploader.upload(localFile,{resource_type: "auto"})
    console.log("file has been successfully uploaded", response.url);
    return response
  } catch (error) {
    fs.unlinkSync(localFile)
    return null;
  }
}

export {cloudinaryUpload}

// cloudinary.uploader
// .upload("my_image.jpg")
// .then(result=>console.log(result));