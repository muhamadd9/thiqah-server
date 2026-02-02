import mongoose from "mongoose";

const connectDB = async () => {
  return await mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.log("Error connecting to MongoDB:", error);
    });
};

export default connectDB;
