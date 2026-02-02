import mongoose from "mongoose";

const analysisResultSchema = new mongoose.Schema(
    {
        file_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            required: true,
            unique: true // One result per file
        },
        baseline_file_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File"
        },
        status: {
            type: String,
            enum: ["safe", "tampered", "processing", "error"],
            required: true
        },
        summary: {
            type: String,
            required: true
        },
        integrity_passed: {
            type: Boolean,
            default: true
        },
        tampering_detected: {
            type: Boolean,
            default: false
        },
        anomalies_found: {
            type: Number,
            default: 0
        },
        high_severity_count: {
            type: Number,
            default: 0
        },
        created_at: {
            type: Date,
            default: Date.now
        },
    },
    { timestamps: true }
);

// Index for faster queries
analysisResultSchema.index({ file_id: 1 });
analysisResultSchema.index({ status: 1 });
analysisResultSchema.index({ created_at: -1 });

const analysisResultModel = mongoose.models.AnalysisResult ||
    mongoose.model("AnalysisResult", analysisResultSchema);

export default analysisResultModel;
