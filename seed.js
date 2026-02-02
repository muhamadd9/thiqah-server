import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import userModel from "./src/DB/model/User.model.js";
import StationModel from "./src/DB/model/Station.model.js";
import ChecklistTemplateModel from "./src/DB/model/ChecklistTemplate.model.js";
import { hashPassword } from "./src/utils/security/hash.js";

// Load env from multiple common locations (first wins)
dotenv.config({ path: path.resolve("./src/config/.env.dev") });
dotenv.config({ path: path.resolve("./src/config/.env") });
dotenv.config({ path: path.resolve("./.env.dev") });
dotenv.config({ path: path.resolve("./.env") });

const seed = async () => {
    try {
        const dbUri = process.env.DB_URI || process.env.DB_CONNECTION;
        if (!dbUri) {
            throw new Error("DB_URI is undefined in process.env. Checked paths: ./src/config/.env.dev, ./src/config/.env, ./.env.dev, ./.env");
        }
        await mongoose.connect(dbUri);
        console.log("Connected to DB");

        // 1. Create Admin
        const adminEmail = "admin@sasco.com";
        let admin = await userModel.findOne({ email: adminEmail });
        if (!admin) {
            admin = await userModel.create({
                fullname: "Admin User",
                email: adminEmail,
                password: hashPassword({ plainText: "12345678" }),
                role: "admin",
                phone: "0500000000"
            });
            console.log("Admin created:", adminEmail);
        } else {
            // Update role if needed
            if (admin.role !== 'admin') {
                admin.role = 'admin';
                await admin.save();
                console.log("Admin role updated");
            }
        }

        // 2. Create Supervisor
        const supervisorEmail = "supervisor@sasco.com";
        if (!await userModel.findOne({ email: supervisorEmail })) {
            await userModel.create({
                fullname: "Khaled Supervisor",
                email: supervisorEmail,
                password: hashPassword({ plainText: "12345678" }),
                role: "supervisor",
                phone: "0555555555"
            });
            console.log("Supervisor created:", supervisorEmail);
        }

        // 3. Create Stations
        if (await StationModel.countDocuments() === 0) {
            await StationModel.insertMany([
                { name: "Sasco Station 1", city: "Riyadh", locationUrl: "https://maps.google.com/?q=24.7136,46.6753" },
                { name: "Sasco Station 2", city: "Jeddah", locationUrl: "https://maps.google.com/?q=21.5433,39.1728" },
                { name: "Sasco Station 3", city: "Dammam", locationUrl: "https://maps.google.com/?q=26.4207,50.0888" }
            ]);
            console.log("Stations created");
        }

        // 4. Create Templates
        if (await ChecklistTemplateModel.countDocuments() === 0) {
            await ChecklistTemplateModel.insertMany([
                {
                    name: "زيارة عامة",
                    items: [
                        { question: "النظافة العامة للمحطة", type: "boolean" },
                        { question: "وضوح اللافتات", type: "boolean" },
                        { question: "مظهر الموظفين", type: "boolean" },
                        { question: "تنظيم المنطقة", type: "boolean" }
                    ]
                },
                {
                    name: "سلامة",
                    items: [
                        { question: "طفايات الحريق صالحة؟", type: "boolean" },
                        { question: "مخارج الطوارئ خالية؟", type: "boolean" },
                        { question: "حقيبة الإسعافات متوفرة؟", type: "boolean" },
                        { question: "إشارات السلامة واضحة؟", type: "boolean" },
                        { question: "معدات الوقاية متوفرة؟", type: "boolean" }
                    ]
                },
                {
                    name: "نظافة",
                    items: [
                        { question: "نظافة الأرضيات", type: "boolean" },
                        { question: "نظافة دورات المياه", type: "boolean" },
                        { question: "صناديق القمامة فارغة؟", type: "boolean" },
                        { question: "نظافة الواجهة الخارجية", type: "boolean" },
                        { question: "نظافة محيط المضخات", type: "boolean" }
                    ]
                },
                {
                    name: "هوية بصرية",
                    items: [
                        { question: "شعار ساسكو واضح ومحدث", type: "boolean" },
                        { question: "اللافتات الإرشادية موحدة", type: "boolean" },
                        { question: "الألوان المؤسسية صحيحة", type: "boolean" },
                        { question: "اللوحات الإعلانية منظمة", type: "boolean" }
                    ]
                },
                {
                    name: "مضخات ومعايرة",
                    items: [
                        { question: "معايرة المضخات دقيقة", type: "boolean" },
                        { question: "شاشات العرض تعمل", type: "boolean" },
                        { question: "خراطيم الوقود بحالة جيدة", type: "boolean" },
                        { question: "أختام المعايرة صالحة", type: "boolean" },
                        { question: "عدادات القراءة واضحة", type: "boolean" }
                    ]
                }
            ]);
            console.log("Templates created");
        }

        console.log("Seeding complete!");
        process.exit(0);

    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seed();
