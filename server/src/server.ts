import express, { json } from "express";
import dotenv from "dotenv";
import { Application } from "express";
import { connectDB } from "./config/db";
import cors from "cors";
import { corsConfig } from "./config/cors";
import projectRoutes from "./routes/project.routes";
import authRoutes from "./routes/auth.routes";
import morgan from "morgan";
import cookieParser from "cookie-parser";
dotenv.config();

// Inicializar app
const app: Application = express();
app.use(express.json());
app.use(cors(corsConfig));
app.use(morgan("dev"));
app.use(cookieParser());

// Inicializar la base dedatos
connectDB();

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

export default app;
