import { Router } from "express";
import {
    register,
    login,
    forgetPassword,
    resetPassword,
    logout,
} from "./Services/auth.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";

const authRouter = Router();

// Auth routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forget-password", forgetPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/logout", authenticationMiddleware, logout);

export default authRouter;
