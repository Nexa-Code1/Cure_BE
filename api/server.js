import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connection from "../src/DB/connection.js";
import routerHandler from "../src/Utils/router-handler.js";
import { globalErrorHandler } from "../src/Middlewares/error-handler-middleware.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use("/uploads", express.static(path.join(__dirname, "../src/uploads")));

routerHandler(app);

app.use(globalErrorHandler);

await connection();

export default app;
