import { Router } from "express";
import {
    register,
    login,
    resetPassword,
    sendOtp,
    verifyOtp,
    logout,
} from "./Services/auth.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";

const authRouter = Router();

// Auth routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/logout", authenticationMiddleware, logout);

export default authRouter;
