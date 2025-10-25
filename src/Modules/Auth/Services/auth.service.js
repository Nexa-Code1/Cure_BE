import bcrypt, { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../../../DB/models/user.model.js";
import { generateOtpEmail } from "../../../Utils/email-template.js";
import { sendEmail } from "../../../Utils/send-email.js";
import { Op } from "sequelize";
import { addTokenToBlacklist } from "../../../Utils/token-blacklist.js";
import s from "stripe";

const stripe = s(process.env.STRIPE_SECRET_KEY);

export const register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        const missingFields = [];
        if (!fullname) missingFields.push("Fullname");
        if (!email) missingFields.push("Email");
        if (!password) missingFields.push("Password");

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `${missingFields.join(", ")} ${
                    missingFields.length > 1 ? "are" : "is"
                } required`,
            });
        }

        const existingUser = await UserModel.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        // CREATING A CUSTOMER IN STRIPE FOR SAVING PAYMENT METHOD
        const customer = await stripe.customers.create({ email });

        await UserModel.create({
            fullname,
            email,
            password,
            phone: "",
            date_of_birth: "",
            gender: null,
            image: "",
            address: "",
            customer_id: customer.id,
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

        if (!email || !password) {
            return res.status(400).json({
                message: `${!email ? "Email" : ""} ${
                    !password ? "Password" : ""
                } ${!email && !password ? "are" : "is"} required`.trim(),
            });
        }

        const user = await UserModel.unscoped().findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_LOGIN, {
            expiresIn: "1h",
        });

        return res.status(200).json({
            message: "User logged in successfully",
            user,
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await UserModel.unscoped().findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const OTP = Math.floor(100000 + Math.random() * 900000).toString();
        const hashOTP = hashSync(OTP, 10);
        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({
            otp_code: hashOTP,
            otp_expires_at: otpExpiration,
        });

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

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await UserModel.unscoped().findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isOtpValid = compareSync(otp, user.otp_code);
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        return res.status(200).json({
            message: "OTP verified successfully",
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        const user = await UserModel.unscoped().findOne({
            where: {
                email,
                otp_expires_at: { [Op.gt]: new Date() },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "Invalid or expired OTP" });
        }

        const isOtpValid = compareSync(otp, user.otp_code);
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

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

export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (token) {
            addTokenToBlacklist(token);
        }
        return res
            .status(200)
            .json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
