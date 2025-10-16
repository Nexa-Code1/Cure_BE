import { Router } from "express";
import { register } from "./Services/auth.service.js";

export const userRouter = Router();

userRouter.post('/register', register);

