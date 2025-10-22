import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import connection from "./DB/connection.js";
import routerHandler from "./Utils/router-handler.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await connection();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://onlinebookingdoctor.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
routerHandler(app);

export default app;
