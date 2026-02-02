import mongoose from "mongoose";

const integrityRecordSchema = new mongoose.Schema(
    {
        file_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            required: true
        },
        hash_value: {
            type: String,
            required: true
        },
        algorithm: {
            type: String,
            default: "SHA-256"
        },
        created_at: {
            type: Date,
            default: Date.now
        },
    },
    { timestamps: true }
);

// Index for faster hash lookups
integrityRecordSchema.index({ file_id: 1 });
integrityRecordSchema.index({ hash_value: 1 });

const integrityRecordModel = mongoose.models.IntegrityRecord ||
    mongoose.model("IntegrityRecord", integrityRecordSchema);

export default integrityRecordModel;
