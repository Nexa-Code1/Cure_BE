import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
import bcrypt from "bcrypt";

class UserModel extends Model {
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.otp_code;
    delete values.otp_expires_at;
    return values;
  }
}

UserModel.init(
  {
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "idx_email",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue(
          "password",
          bcrypt.hashSync(value, +process.env.SALT)
        );
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["male", "female"]],
          msg: 'Gender must be either "male" or "female"',
        },
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    otp_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "tbl_users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    defaultScope: {
      attributes: { exclude: ["password", "otp_code", "otp_expires_at"] },
    },
  }
);

export default UserModel;
