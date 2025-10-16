import { DataTypes, Model } from "sequelize";
import  {sequelize}  from "../connection.js";

class UserModel extends Model {}

UserModel.init({
    fullname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "idx_email",
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'tbl_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default UserModel;


