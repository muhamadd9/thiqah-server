import mongoose from "mongoose";

const anomalyDetectionSchema = new mongoose.Schema(
    {
        file_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            required: true
        },
        column_name: {
            type: String,
            required: true
        },
        row_number: {
            type: Number,
            required: true
        },
        suspicious_value: {
            type: String,
            required: true
        },
        expected_range: {
            type: String // e.g., "$45,000 - $55,000"
        },
        reason: {
            type: String // e.g., "400% higher than average debit transactions"
        },
        confidence_score: {
            type: Number,
            min: 0,
            max: 1,
            required: true
        },
        severity_level: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        detected_at: {
            type: Date,
            default: Date.now
        },
    },
    { timestamps: true }
);

// Index for faster queries
anomalyDetectionSchema.index({ file_id: 1 });
anomalyDetectionSchema.index({ confidence_score: -1 });
anomalyDetectionSchema.index({ severity_level: 1 });

const anomalyDetectionModel = mongoose.models.AnomalyDetection ||
    mongoose.model("AnomalyDetection", anomalyDetectionSchema);

export default anomalyDetectionModel;
