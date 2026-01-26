import cloudinary from "../Config/cloudinary.js";

export const uploadToCloudinary = (buffer, folder = "pitchwear/products") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      resolve(result.secure_url);
    }).end(buffer);
  });
};
