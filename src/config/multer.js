import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const userStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Cure/users",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
export const uploadUserImage = multer({ storage: userStorage });

const doctorStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Cure/doctors",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
export const uploadDoctorImage = multer({ storage: doctorStorage });
