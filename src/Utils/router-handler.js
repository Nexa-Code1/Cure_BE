import userRouter from "../Modules/Auth/auth.controller.js";
import { globalErrorHandler } from "../Middlewares/error-handler-middleware.js";

const routerHandler = (app) => {
    app.use('/api/auth', userRouter);

    app.use(globalErrorHandler);
};

export default routerHandler;
