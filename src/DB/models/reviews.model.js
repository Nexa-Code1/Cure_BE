import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
import DoctorModel from "./doctor.model.js";
import UserModel from "./user.model.js";

class ReviewModel extends Model {}

ReviewModel.init(
  {
    rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "tbl_reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

DoctorModel.hasMany(ReviewModel, {
  foreignKey: "doctor_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "reviews",
});
ReviewModel.belongsTo(DoctorModel, { foreignKey: "doctor_id" });

UserModel.hasMany(ReviewModel, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "reviews",
});
ReviewModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });

export default ReviewModel;
