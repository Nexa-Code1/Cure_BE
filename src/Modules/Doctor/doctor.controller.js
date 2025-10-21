import { Router } from "express";
import {
  addDoctor,
  getDoctors,
  getDoctorById,
  getTopRatedDoctors,
} from "./Services/doctor.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
import { upload } from "./../../Middlewares/upload-middleware.js";

const doctorRouter = Router();

doctorRouter.post("/add-doctor", upload.single("image"), addDoctor);
doctorRouter.get("/get-doctors", authenticationMiddleware, getDoctors);
doctorRouter.get("/get-doctor/:id", authenticationMiddleware, getDoctorById);
doctorRouter.get(
  "/get-top-rated-doctors",
  authenticationMiddleware,
  getTopRatedDoctors
);

export default doctorRouter;
