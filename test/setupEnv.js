import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app, { initApp, io, server } from "../api/index.js";

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.DB_URI = mongoServer.getUri();
    process.env.NODE_ENV = "test";
    process.env.USER_ACCESS_TOKEN = "testsecret";
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "123";
    process.env.CLOUDINARY_API_SECRET = "abc";
    initApp();
});

afterAll(async () => {
    if (mongoose.connection.readyState) {
        await mongoose.connection.close();
    }
    if (mongoServer) await mongoServer.stop();
    try { io && io.close && io.close(); } catch { }
    try { server && server.close && server.close(); } catch { }
});


