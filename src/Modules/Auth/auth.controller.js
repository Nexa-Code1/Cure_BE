import { Router } from "express";
import {
  register,
  login,
  forgetPassword,
  resetPassword,
} from "./Services/auth.service.js";

const authRouter = Router();

// Auth routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forget-password", forgetPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
