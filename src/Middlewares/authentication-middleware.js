import UserModel from "../DB/models/user.model.js";
import jwt from "jsonwebtoken";

export const authenticationMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Unauthorized, please login!" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET_LOGIN);

    const user = await UserModel.findOne({ where: { id: data.id } });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized, please login!" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token!" });
  }
};
