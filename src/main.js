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

const bootstrap = async () => {
  await connection();

  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://onlinebookingdoctor.netlify.app",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  routerHandler(app);

  const PORT = process.env.PORT || 3000;
  app
    .listen(PORT, () => console.log(`Server is running on port ${PORT}`))
    .on("error", (error) => console.error("Server error:", error));
};

export default bootstrap;
