import { v2 as cloudinary } from "cloudinary";

// ✅ configure cloudinary using .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ default export (important)
export default cloudinary;
