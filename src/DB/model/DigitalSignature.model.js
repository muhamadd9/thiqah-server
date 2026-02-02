import mongoose from "mongoose";

const digitalSignatureSchema = new mongoose.Schema(
    {
        file_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        public_key: {
            type: String,
            required: true
        },
        signature_value: {
            type: String,
            required: true
        },
        algorithm: {
            type: String,
            default: "RSA-SHA256"
        },
        signed_at: {
            type: Date,
            default: Date.now
        },
        is_verified: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Index for faster queries
digitalSignatureSchema.index({ file_id: 1 });
digitalSignatureSchema.index({ user_id: 1 });

const digitalSignatureModel = mongoose.models.DigitalSignature ||
    mongoose.model("DigitalSignature", digitalSignatureSchema);

export default digitalSignatureModel;
