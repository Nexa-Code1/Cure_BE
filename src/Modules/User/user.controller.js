import { Router } from "express";
import {
    createSetupIntent,
    deleteMyProfile,
    getMyProfile,
    getPaymentMethods,
    removePaymentMethod,
    updateMyProfile,
    updatePassword,
    addPaymentMethod,
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
/* ============== FOR STRIPE ============== */
userRouter.post(
    "/create-setup-intent",
    authenticationMiddleware,
    createSetupIntent
);
userRouter.post(
    "/add-payment-method",
    authenticationMiddleware,
    addPaymentMethod
);
userRouter.post(
    "/remove-payment-method",
    authenticationMiddleware,
    removePaymentMethod
);
userRouter.get("/payment-methods", authenticationMiddleware, getPaymentMethods);
/* ============== FOR STRIPE ============== */

export default userRouter;
