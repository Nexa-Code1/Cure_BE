import { Router } from "express";
import { authenticationMiddleware } from "./../../Middlewares/authentication-middleware.js";
import {
    getMyBookings,
    cancelReserve,
    reserveDoctor,
    completeBooking,
    bookingIntent,
} from "./Services/booking.service.js";

const bookingRouter = Router();

bookingRouter.get("/my-bookings", authenticationMiddleware, getMyBookings);
bookingRouter.post("/book-intent/:id", authenticationMiddleware, bookingIntent);
bookingRouter.post("/book-doctor/:id", authenticationMiddleware, reserveDoctor);
bookingRouter.put(
    "/complete-booking/:id",
    authenticationMiddleware,
    completeBooking
);
bookingRouter.delete(
    "/cancel-doctor/:id",
    authenticationMiddleware,
    cancelReserve
);

export default bookingRouter;
