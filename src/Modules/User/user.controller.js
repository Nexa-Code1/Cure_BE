import { Router } from "express";
import {
  deleteMyProfile,
  getMyProfile,
  updateMyProfile,
  updatePassword,
} from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import { upload } from "../../Middlewares/upload-middleware.js";

const userRouter = Router();

userRouter.get("/profile", authenticationMiddleware, getMyProfile);
userRouter.put(
  "/update-profile",
  authenticationMiddleware,
  upload.single("image"),
  updateMyProfile
);
userRouter.patch("/update-password", authenticationMiddleware, updatePassword);
userRouter.delete("/delete-profile", authenticationMiddleware, deleteMyProfile);

export default userRouter;
