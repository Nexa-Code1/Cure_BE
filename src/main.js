import connection from "./DB/connection.js";
import express from "express";
import cors from "cors";
import routerHandler from "./Utils/router-handler.js";

const app = express();
import dotenv from "dotenv";
dotenv.config();

const bootstrap = async () => {
    await connection();
    app.use(express.json());

    // Allow requests from your frontend
    app.use(
        cors({
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            credentials: true,
        })
    );

    routerHandler(app);

    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    }).on("error", (error) => {
        console.error("Server error:", error);
    });
};

export default bootstrap;
