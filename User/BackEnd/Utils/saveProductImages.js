import sharp from "sharp";
import { uploadToCloudinary } from "./cloudinaryUpload.js";

export const saveProductImages = async (files) => {
  const urls = [];

  for (const file of files) {
    const resized = await sharp(file.buffer)
      .resize(900, 900, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();

    const url = await uploadToCloudinary(resized);
    urls.push(url);
  }

  return urls;
};
