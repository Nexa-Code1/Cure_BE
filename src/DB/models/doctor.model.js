import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class DoctorModel extends Model {}

DoctorModel.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    about: { type: DataTypes.STRING, allowNull: false },
    specialty: { type: DataTypes.STRING, allowNull: false },
    available_slots: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    start_time: { type: DataTypes.STRING, allowNull: false },
    end_time: { type: DataTypes.STRING, allowNull: false },
    address: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    price: { type: DataTypes.FLOAT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    experience: { type: DataTypes.INTEGER, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    is_favourite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "tbl_doctors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default DoctorModel;
