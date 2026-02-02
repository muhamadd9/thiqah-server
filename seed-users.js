import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "./src/config/.env.dev") });

import connectDB from "./src/DB/connection.js";
import userModel from "./src/DB/model/User.model.js";
import { hashPassword } from "./src/utils/security/hash.js";

const seedUsers = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing users (optional - comment out if you want to keep existing users)
        // await userModel.deleteMany({});

        // Create seed users
        const users = [
            {
                fullname: "John Student",
                email: "student@test.com",
                password: hashPassword({ plainText: "password123" }),
                role: "student",
                isActive: true
            },
            {
                fullname: "Sarah Accountant",
                email: "accountant@test.com",
                password: hashPassword({ plainText: "password123" }),
                role: "accountant",
                isActive: true
            },
            {
                fullname: "Admin User",
                email: "admin@test.com",
                password: hashPassword({ plainText: "password123" }),
                role: "admin",
                isActive: true
            },
            {
                fullname: "Test Student",
                email: "test@test.com",
                password: hashPassword({ plainText: "password" }),
                role: "student",
                isActive: true
            }
        ];

        // Insert users
        for (const userData of users) {
            const existingUser = await userModel.findOne({ email: userData.email });
            if (!existingUser) {
                await userModel.create(userData);
                console.log(`✅ Created user: ${userData.email}`);
            } else {
                console.log(`ℹ️  User already exists: ${userData.email}`);
            }
        }

        console.log("\n🎉 Seed completed successfully!");
        console.log("\n📝 Test Users:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Student:    student@test.com    / password123");
        console.log("Accountant: accountant@test.com / password123");
        console.log("Admin:      admin@test.com      / password123");
        console.log("Test User:  test@test.com       / password");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedUsers();
