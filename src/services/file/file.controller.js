import { Router } from "express";
import * as fileController from "./file.service.js";
import { authentication } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { uploadFileSchema, getFileByIdSchema } from "./file.validation.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configure multer for file uploads
const uploadDir = "uploads/files";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [".csv", ".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only CSV and Excel files are allowed"));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.post("/upload-baseline", authentication(), upload.single("file"), fileController.uploadBaseline);
router.post("/upload-check", authentication(), upload.single("file"), fileController.uploadForCheck);
router.get("/user-files", authentication(), fileController.getUserFiles);
router.get("/:fileId", authentication(), validate(getFileByIdSchema), fileController.getFileById);

export default router;
