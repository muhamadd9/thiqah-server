import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve("./src/config/.env.dev") });

export const fileValidations = {
  image: ["image/jpeg", "image/png", "image/jpg"],
  document: ["application/pdf", "application/msword"],
  video: ["video/mp4", "video/mpeg", "video/quicktime"],
};

// Ensure Cloudinary has credentials; rely on env loaded by index.js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const memoryStorage = multer.memoryStorage();

const fileFilter = ({ fileValidation = [] }) => {
  return (req, file, cb) => {
    if (!fileValidation.length || fileValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  };
};

export const uploadSingle = ({ fieldName = "image", fileValidation = fileValidations.image }) =>
  multer({ storage: memoryStorage, fileFilter: fileFilter({ fileValidation }) }).single(fieldName);

export const uploadMultiple = ({ fieldName = "images", maxCount = 10, fileValidation = fileValidations.image }) =>
  multer({ storage: memoryStorage, fileFilter: fileFilter({ fileValidation }) }).array(fieldName, maxCount);

const bufferToDataURI = (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

export const uploadFileToCloudinary = async (file, folder = "artscape") => {
  const fileStr = bufferToDataURI(file);
  const result = await cloudinary.uploader.upload(fileStr, { folder });
  return { url: result.secure_url, public_id: result.public_id };
};

export const attachUploadedImageUrl = (folder = "artscape", targetField = null) => {
  return async (req, res, next) => {
    try {
      // Handle single file upload
      if (req.file) {
        const uploaded = await uploadFileToCloudinary(req.file, folder);
        // Use targetField if provided, otherwise use the fieldName from req.file, fallback to "image"
        const fieldName = targetField || req.file.fieldname || "image";
        req.body[fieldName] = uploaded;
        // Remove any other image field that might have been set incorrectly
        if (fieldName !== "image" && req.body.image) {
          delete req.body.image;
        }
      }

      // Handle multiple files upload (for arts)
      if (req.files && Array.isArray(req.files) && req.files.length) {
        const urls = [];
        for (const f of req.files) {
          const u = await uploadFileToCloudinary(f, folder);
          urls.push(u);
        }
        req.body.images = urls;
      }

      return next();
    } catch (e) {
      return next(e);
    }
  };
};
