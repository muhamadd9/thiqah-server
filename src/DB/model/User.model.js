import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, unique: true, sparse: true, trim: true },
    role: {
      type: String,
      enum: ["admin", "student", "accountant"],
      default: "student"
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure at least email or phone is present
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    next(new Error('Either email or phone is required'));
  } else {
    next();
  }
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
