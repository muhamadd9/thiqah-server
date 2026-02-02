import { asyncHandler } from "../../utils/response/error.response.js";
import fileModel from "../../DB/model/File.model.js";
import integrityRecordModel from "../../DB/model/IntegrityRecord.model.js";
import { create, findOne, find } from "../../DB/dbService.js";
import { successResponse } from "../../utils/response/success.response.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import Papa from "papaparse";

/* Upload Baseline File */
export const uploadBaseline = asyncHandler(async (req, res, next) => {
    const { id: userId } = req.authUser;
    const file = req.file;

    if (!file) {
        return next(new Error("File is required", { cause: 400 }));
    }

    // Determine file type
    const ext = path.extname(file.originalname).toLowerCase();
    const fileType = ext === ".csv" ? "csv" : "excel";

    // Check if user already has a baseline file
    const existingBaseline = await findOne({
        model: fileModel,
        filter: { user_id: userId, is_baseline: true }
    });

    if (existingBaseline) {
        return next(new Error("Baseline file already exists. Please delete it first.", { cause: 400 }));
    }

    // Create file record
    const fileRecord = await create({
        model: fileModel,
        data: {
            user_id: userId,
            file_name: file.originalname,
            file_path: file.path,
            file_type: fileType,
            file_size: file.size,
            is_baseline: true
        }
    });

    // Generate hash
    const fileBuffer = fs.readFileSync(file.path);
    const hashValue = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // Store integrity record
    await create({
        model: integrityRecordModel,
        data: {
            file_id: fileRecord._id,
            hash_value: hashValue,
            algorithm: "SHA-256"
        }
    });

    return successResponse({
        res,
        data: {
            file: fileRecord,
            hash: hashValue,
            message: "Baseline file uploaded successfully"
        }
    });
});

/* Upload File for Tampering Check */
export const uploadForCheck = asyncHandler(async (req, res, next) => {
    const { id: userId } = req.authUser;
    const file = req.file;

    if (!file) {
        return next(new Error("File is required", { cause: 400 }));
    }

    // Check if baseline exists
    const baseline = await findOne({
        model: fileModel,
        filter: { user_id: userId, is_baseline: true }
    });

    if (!baseline) {
        return next(new Error("Please upload a baseline file first", { cause: 400 }));
    }

    // Determine file type
    const ext = path.extname(file.originalname).toLowerCase();
    const fileType = ext === ".csv" ? "csv" : "excel";

    // Create file record
    const fileRecord = await create({
        model: fileModel,
        data: {
            user_id: userId,
            file_name: file.originalname,
            file_path: file.path,
            file_type: fileType,
            file_size: file.size,
            is_baseline: false
        }
    });

    // Generate hash
    const fileBuffer = fs.readFileSync(file.path);
    const hashValue = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // Store integrity record
    await create({
        model: integrityRecordModel,
        data: {
            file_id: fileRecord._id,
            hash_value: hashValue,
            algorithm: "SHA-256"
        }
    });

    return successResponse({
        res,
        data: {
            file: fileRecord,
            hash: hashValue,
            baseline_id: baseline._id,
            message: "File uploaded successfully. Ready for analysis."
        }
    });
});

/* Get all files for user */
export const getUserFiles = asyncHandler(async (req, res, next) => {
    const { id: userId } = req.authUser;

    const files = await find({
        model: fileModel,
        filter: { user_id: userId },
        sort: { upload_date: -1 }
    });

    return successResponse({ res, data: { files } });
});

/* Get specific file */
export const getFileById = asyncHandler(async (req, res, next) => {
    const { fileId } = req.params;
    const { id: userId } = req.authUser;

    const file = await findOne({
        model: fileModel,
        filter: { _id: fileId, user_id: userId }
    });

    if (!file) {
        return next(new Error("File not found", { cause: 404 }));
    }

    return successResponse({ res, data: { file } });
});

/* Parse CSV file */
export const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const fileContent = fs.readFileSync(filePath, "utf8");

        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

/* Parse Excel file */
export const parseExcel = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    return data;
};

/* Helper: Parse file based on type */
export const parseFile = async (fileRecord) => {
    if (fileRecord.file_type === "csv") {
        return await parseCSV(fileRecord.file_path);
    } else {
        return parseExcel(fileRecord.file_path);
    }
};
