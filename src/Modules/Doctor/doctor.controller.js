import { Router } from "express";
import {
  addDoctor,
  getDoctors,
  getDoctorById,
  getDoctorBySpecialty,
  getTopRatedDoctors,
} from "./Services/doctor.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";

const doctorRouter = Router();

doctorRouter.post("/add-doctor", addDoctor);
doctorRouter.get("/get-doctors", authenticationMiddleware, getDoctors);
doctorRouter.get("/get-doctor/:id", authenticationMiddleware, getDoctorById);
doctorRouter.get(
  "/get-doctor-by-specialty/:specialty",
  authenticationMiddleware,
  getDoctorBySpecialty
);
doctorRouter.get(
  "/get-top-rated-doctors",
  authenticationMiddleware,
  getTopRatedDoctors
);

export default doctorRouter;
