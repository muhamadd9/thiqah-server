import express from "express";
import * as dotenv from "dotenv";
import path from "node:path";
import { createServer } from "http";


// Load env from multiple common locations (first wins)
dotenv.config({ path: path.resolve("./src/config/.env.dev") });
dotenv.config({ path: path.resolve("./src/config/.env") });
dotenv.config({ path: path.resolve("./.env.dev") });
dotenv.config({ path: path.resolve("./.env") });
import bootstrap from "./src/app.controller.js";

const app = express();
const server = createServer(app);

export const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
};

const port = process.env.PORT || 3400;

// Serve uploaded files
app.use('/uploads', express.static(path.resolve('./uploads')));

bootstrap(app, express, corsOptions);


server.listen(port, async () => {
  console.log(`Server listening on port ${port}!`);
});
