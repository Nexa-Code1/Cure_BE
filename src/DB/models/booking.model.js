import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
import UserModel from "./user.model.js";
import DoctorModel from "./doctor.model.js";

class BookingModel extends Model {}

BookingModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        day: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slot: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        payment_intent: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("upcoming", "completed", "cancelled"),
            allowNull: false,
            defaultValue: "upcoming",
        },
    },
    {
        sequelize,
        modelName: "tbl_bookings",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

UserModel.hasMany(BookingModel, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "bookings",
});
BookingModel.belongsTo(UserModel, { foreignKey: "user_id" });

DoctorModel.hasMany(BookingModel, {
    foreignKey: "doctor_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "bookings",
});
BookingModel.belongsTo(DoctorModel, { foreignKey: "doctor_id", as: "doctor" });

export default BookingModel;
