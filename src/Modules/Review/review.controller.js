import { Router } from "express";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import { addReview } from "./Services/review.service.js";
import { updateReview } from "./Services/review.service.js";

const reviewRouter = Router();

reviewRouter.post("/add-review/:id", authenticationMiddleware, addReview);
reviewRouter.put("/update-review/:id", authenticationMiddleware, updateReview);

export default reviewRouter;
