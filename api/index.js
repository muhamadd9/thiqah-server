import express from "express";
import * as dotenv from "dotenv";
import path from "node:path";
import { createServer } from "http";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();

import bootstrap from "../src/app.controller.js";

const app = express();

// CORS configuration for production
export const corsOptions = {
    origin: process.env.CLIENT_URL || "https://your-client-domain.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
};

// Create HTTP server
export const server = createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
    cors: corsOptions,
});

// Set Socket.io instance on app
app.set("io", io);

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("connect_error", (error) => {
        console.error("Server-side connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
        console.log("User disconnected:", socket.id, "Reason:", reason);
    });
});

// Helper to bootstrap (used by tests too)
export const initApp = () => bootstrap(app, express, corsOptions);

// Bootstrap automatically unless in test environment
if (process.env.NODE_ENV !== "test") {
    initApp();
}

// Export the app for Vercel
export default app;
