import { globalErrorHandler } from "../Middlewares/error-handler-middleware.js";
import authRouter from "../Modules/Auth/auth.controller.js";
import doctorRouter from "../Modules/Doctor/doctor.controller.js";
import reviewRouter from "../Modules/Review/review.controller.js";
import favRouter from "../Modules/Favourite/fav.controller.js";
import bookingRouter from "../Modules/Booking/booking.controller.js";
import userRouter from "../Modules/User/user.controller.js";
import specialistsRouter from "../Modules/Specialists/specialists.controller.js";

const routerHandler = (app) => {
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/api/doctor", doctorRouter);
    app.use("/api/review", reviewRouter);
    app.use("/api/favourite", favRouter);
    app.use("/api/booking", bookingRouter);
    app.use("/api/specialists", specialistsRouter);

    app.use(globalErrorHandler);
};

export default routerHandler;
