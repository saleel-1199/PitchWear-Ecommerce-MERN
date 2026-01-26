import multer from "multer";

// store files in memory (needed for sharp + cloudinary)
const storage = multer.memoryStorage();

// file filter (allow only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const uploadProducts = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
  },
});

export default uploadProducts; // ✅ THIS IS REQUIRED
