import { Router } from "express";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import {
  createSetupIntent,
  addPaymentMethod,
  removePaymentMethod,
  getPaymentMethods,
} from "./Services/payment.services.js";
const paymentRouter = Router();

paymentRouter.get(
  "/payment-methods",
  authenticationMiddleware,
  getPaymentMethods
);
paymentRouter.post(
  "/create-setup-intent",
  authenticationMiddleware,
  createSetupIntent
);
paymentRouter.post(
  "/add-payment-method",
  authenticationMiddleware,
  addPaymentMethod
);
paymentRouter.post(
  "/remove-payment-method",
  authenticationMiddleware,
  removePaymentMethod
);

export default paymentRouter;
