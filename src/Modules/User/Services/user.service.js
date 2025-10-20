import UserModel from "../../../DB/models/user.model.js";
import { compareSync, hashSync } from "bcrypt";

export const getMyProfile = async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  const BASE_URL = process.env.BASE_URL;
  try {
    const { fullname, email, phone, date_of_birth } = req.body;
    const userImage = req.file;

    const [updated] = await UserModel.update(
      {
        fullname,
        email,
        phone,
        date_of_birth,
        image: `${BASE_URL}/uploads/${userImage.filename}`,
      },
      { where: { id: req.user.id } }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    const user = await UserModel.unscoped().findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    const hashedPassword = hashSync(newPassword, 10);

    await UserModel.update(
      { password: hashedPassword },
      { where: { id: req.user.id } }
    );

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteMyProfile = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await UserModel.unscoped().findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    await UserModel.destroy({ where: { id: req.user.id } });
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
