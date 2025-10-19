import { Router } from "express";
import {
    register,
    login,
    forgetPassword,
    resetPassword,
    updatePassword,
    logout,
} from "./Services/auth.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import { errorHandlerMiddleware } from "../../Middlewares/error-handler-middleware.js";

const userRouter = Router();

// Auth routes
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/forget-password", forgetPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/update-password", authenticationMiddleware, updatePassword);
userRouter.post("/logout", authenticationMiddleware, logout);

export default userRouter;
