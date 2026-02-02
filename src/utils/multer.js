import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

export const fileValidation = {
    image: ["image/jpeg", "image/png", "image/gif"],
    file: ["application/pdf", "application/msword"],
};

export const fileUpload = (customValidation = []) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const dest = "uploads";
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            cb(null, nanoid() + "_" + file.originalname);
        },
    });

    const fileFilter = (req, file, cb) => {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file format"), false);
        }
    };

    const upload = multer({ fileFilter, storage });
    return upload;
}
