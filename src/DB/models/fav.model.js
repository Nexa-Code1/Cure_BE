import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
import UserModel from "./user.model.js";
import DoctorModel from "./doctor.model.js";

class FavModel extends Model {}

FavModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "tbl_favourites",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

UserModel.hasMany(FavModel, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "favourites",
});
FavModel.belongsTo(UserModel, { foreignKey: "user_id" });

DoctorModel.hasMany(FavModel, {
  foreignKey: "doctor_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "favourites",
});
FavModel.belongsTo(DoctorModel, { foreignKey: "doctor_id", as: "doctor" });

export default FavModel;
