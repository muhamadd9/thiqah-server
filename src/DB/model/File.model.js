import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        file_name: {
            type: String,
            required: true,
            trim: true
        },
        file_path: {
            type: String,
            required: true
        },
        file_type: {
            type: String,
            enum: ["csv", "excel"],
            required: true
        },
        file_size: {
            type: Number,
            required: true
        },
        upload_date: {
            type: Date,
            default: Date.now
        },
        is_baseline: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

// Index for faster queries
fileSchema.index({ user_id: 1, upload_date: -1 });
fileSchema.index({ is_baseline: 1 });

const fileModel = mongoose.models.File || mongoose.model("File", fileSchema);

export default fileModel;
