import { Router } from "express";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import { getSpecialists } from "./Services/specialists.service.js";

const specialistsRouter = Router();

specialistsRouter.get("/", authenticationMiddleware, getSpecialists);

export default specialistsRouter;
