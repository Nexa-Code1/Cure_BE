import bcrypt, { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../../../DB/models/user.model.js";
import { generateOtpEmail } from "../../../Utils/email-template.js";
import { sendEmail } from "../../../Utils/send-email.js";
import { Op } from "sequelize";

export const register = async (req, res) => {
  try {
    const {
      fullname,
      email,
      password,
      phone,
      date_of_birth,
      gender,
      image,
      address,
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!fullname) missingFields.push("Fullname");
    if (!email) missingFields.push("Email");
    if (!password) missingFields.push("Password");
    if (!phone) missingFields.push("Phone");
    if (!date_of_birth) missingFields.push("Date of birth");
    if (!gender) missingFields.push("Gender");
    if (!image) missingFields.push("Image");
    if (!address) missingFields.push("Address");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `${missingFields.join(", ")} ${
          missingFields.length > 1 ? "are" : "is"
        } required`,
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Create new user
    const newUser = await UserModel.create({
      fullname,
      email,
      password,
      phone,
      date_of_birth,
      gender,
      image,
      address,
    });

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: `${!email ? "Email" : ""} ${!password ? "Password" : ""} ${
          !email && !password ? "are" : "is"
        } required`.trim(),
      });
    }

    // Check if user exists
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_LOGIN, {
      expiresIn: "1h",
    });

    // Remove password from response
    const { password: _, ...userData } = user.toJSON();

    return res.status(200).json({
      message: "User logged in successfully",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate and hash OTP
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    const hashOTP = hashSync(OTP, 10);
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP in DB
    await user.update({
      otp_code: hashOTP,
      otp_expires_at: otpExpiration,
    });

    // Send OTP via email (fake or real)
    sendEmail.emit("SendEmail", {
      to: email,
      subject: "Reset Password OTP",
      html: generateOtpEmail(OTP),
    });

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Forget Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user
    const user = await UserModel.findOne({
      where: {
        email,
        otp_expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid or expired OTP" });
    }

    // Compare OTP
    const isOtpValid = compareSync(otp, user.otp_code);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update password and clear OTP
    await user.update({
      password: newPassword,
      otp_code: null,
      otp_expires_at: null,
    });

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    // Find user
    const user = await UserModel.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare current password
    const isPasswordValid = compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    // Update password
    await user.update({ password: newPassword });

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

