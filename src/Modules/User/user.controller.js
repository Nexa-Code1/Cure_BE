import { Router } from "express";
import {
  deleteMyProfile,
  getMyProfile,
  updateMyProfile,
  updatePassword,
} from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";

const userRouter = Router();

userRouter.get("/profile", authenticationMiddleware, getMyProfile);
userRouter.put("/update-profile", authenticationMiddleware, updateMyProfile);
userRouter.patch("/update-password", authenticationMiddleware, updatePassword);
userRouter.delete("/delete-profile", authenticationMiddleware, deleteMyProfile);

export default userRouter;
