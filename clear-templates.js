import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import ChecklistTemplateModel from "./src/DB/model/ChecklistTemplate.model.js";

// Load env
dotenv.config({ path: path.resolve("./src/config/.env.dev") });
dotenv.config({ path: path.resolve("./src/config/.env") });
dotenv.config({ path: path.resolve("./.env.dev") });
dotenv.config({ path: path.resolve("./.env") });

const clearTemplates = async () => {
    try {
        const dbUri = process.env.DB_URI || process.env.DB_CONNECTION;
        if (!dbUri) {
            throw new Error("DB_URI is undefined in process.env");
        }
        await mongoose.connect(dbUri);
        console.log("Connected to DB");

        // Delete all templates
        const result = await ChecklistTemplateModel.deleteMany({});
        console.log(`Deleted ${result.deletedCount} templates`);

        console.log("Templates cleared! Now run: npm run seed");
        process.exit(0);

    } catch (error) {
        console.error("Clear failed:", error);
        process.exit(1);
    }
};

clearTemplates();
