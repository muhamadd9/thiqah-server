import mongoose from "mongoose";

const tamperAnalysisSchema = new mongoose.Schema(
    {
        file_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            required: true
        },
        change_type: {
            type: String,
            enum: ["modified", "added", "deleted"],
            required: true
        },
        location: {
            type: String,
            required: true // Format: "row:X, column:Y" or "Row X"
        },
        row_number: {
            type: Number
        },
        column_name: {
            type: String
        },
        old_value: {
            type: String,
            default: null
        },
        new_value: {
            type: String,
            default: null
        },
        severity_level: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
    },
    { timestamps: true }
);

// Index for faster queries by file
tamperAnalysisSchema.index({ file_id: 1 });
tamperAnalysisSchema.index({ severity_level: 1 });

const tamperAnalysisModel = mongoose.models.TamperAnalysis ||
    mongoose.model("TamperAnalysis", tamperAnalysisSchema);

export default tamperAnalysisModel;
