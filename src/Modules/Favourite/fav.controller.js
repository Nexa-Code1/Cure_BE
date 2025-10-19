import { Router } from "express";
import {
  addFavourite,
  deleteFavourite,
  getFavourite,
} from "./Services/fav.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication-middleware.js";
const favRouter = Router();

favRouter.get("/get-favourites", authenticationMiddleware, getFavourite);
favRouter.post(
  "/add-favourite/:doctor_id",
  authenticationMiddleware,
  addFavourite
);
favRouter.delete(
  "/delete-favourite/:doctor_id",
  authenticationMiddleware,
  deleteFavourite
);

export default favRouter;
