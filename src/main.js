import connection from "./DB/connection.js";
import express from "express";
import routerHandler from "./Utils/router-handler.js";

const app = express();
import dotenv from "dotenv";
dotenv.config();

const bootstrap = async () => {
  await connection();
  app.use(express.json());
  app.use("/uploads", express.static("uploads"));

  routerHandler(app);

  app
    .listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    })
    .on("error", (error) => {
      console.error("Server error:", error);
    });
};

export default bootstrap;
