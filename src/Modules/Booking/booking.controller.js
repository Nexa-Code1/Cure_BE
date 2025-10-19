import { Router } from "express";
import { authenticationMiddleware } from "./../../Middlewares/authentication-middleware.js";
import {
  getMyBookings,
  cancelReserve,
  reserveDoctor,
} from "./Services/booking.service.js";

const bookingRouter = Router();

bookingRouter.get("/my-bookings", authenticationMiddleware, getMyBookings);
bookingRouter.post("/book-doctor/:id", authenticationMiddleware, reserveDoctor);
bookingRouter.delete(
  "/cancel-doctor/:id",
  authenticationMiddleware,
  cancelReserve
);

export default bookingRouter;
