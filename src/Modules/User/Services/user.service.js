import UserModel from "../../../DB/models/user.model.js";
import { compareSync, hashSync } from "bcrypt";
import s from "stripe";

const stripe = s(process.env.STRIPE_SECRET_KEY);

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
        const { fullname, email, phone, date_of_birth, address, gender } =
            req.body;
        const userImage = req.file;

        const [updated] = await UserModel.update(
            {
                fullname,
                email,
                phone,
                date_of_birth,
                image: `${BASE_URL}/${userImage.filename}`,
                address,
                gender,
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
            return res
                .status(400)
                .json({ message: "Invalid current password" });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }

        await UserModel.update(
            { password: newPassword },
            { where: { id: req.user.id } }
        );

        return res
            .status(200)
            .json({ message: "Password updated successfully" });
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
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

/* ============== FOR STRIPE ============== */
export const createSetupIntent = async (req, res) => {
    try {
        const { customer_id } = req.user;

        const setupIntent = await stripe.setupIntents.create({
            customer: customer_id,
            payment_method_types: ["card"],
        });

        res.status(200).json({ clientSecret: setupIntent.client_secret });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const addPaymentMethod = async (req, res) => {
    try {
        const { pm_id } = req.body;
        const user = req.user;

        const paymentMethod = await stripe.paymentMethods.attach(pm_id, {
            customer: user.customer_id,
        });

        const fingerprint = paymentMethod.card?.fingerprint;
        if (!fingerprint)
            return res.status(404).json({ message: "fingerprint not found" });

        // Parse stripe_payment_methods if it's a string
        let stripe_payment_methods = user.stripe_payment_methods;
        if (typeof stripe_payment_methods === "string") {
            stripe_payment_methods = JSON.parse(stripe_payment_methods);
        }

        // Check if fingerprint is already exist
        const existingFingerpring = stripe_payment_methods.findIndex(
            (method) => method.fingerprint === fingerprint
        );

        if (existingFingerpring !== -1) {
            await stripe.paymentMethods.detach(pm_id);
            return res
                .status(401)
                .json({ message: "Payment method is already exist" });
        }

        // Updating stripe_payment_methods in user table
        const newPaymentMethodsArr = !stripe_payment_methods
            ? [{ pm_id, fingerprint }]
            : [...stripe_payment_methods, { pm_id, fingerprint }];
        const [updated] = await UserModel.update(
            {
                stripe_payment_methods: newPaymentMethodsArr,
            },
            { where: { id: user.id } }
        );
        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Payment method was added successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removePaymentMethod = async (req, res) => {
    try {
        const { pm_id } = req.body;

        const detached = await stripe.paymentMethods.detach(pm_id);

        // Parse stripe_payment_methods if it's a string
        let stripe_payment_methods = req.user.stripe_payment_methods;
        if (typeof stripe_payment_methods === "string") {
            stripe_payment_methods = JSON.parse(stripe_payment_methods);
        }

        // Find payment method id
        const paymentMethodId = stripe_payment_methods.find(
            (paymentMethod) => paymentMethod.pm_id === pm_id
        );
        if (!paymentMethodId)
            return res
                .status(404)
                .json({ message: "Cannot find payment method" });

        const newPaymentMethodsArr = stripe_payment_methods.filter(
            (paymentMethod) => paymentMethod.pm_id !== pm_id
        );

        const [updated] = await UserModel.update(
            {
                stripe_payment_methods: newPaymentMethodsArr,
            },
            { where: { id: req.user.id } }
        );

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Payment method was deleted successfully",
            paymentMethod: detached,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPaymentMethods = async (req, res) => {
    try {
        const { customer_id } = req.user;

        const paymentMethods = await stripe.paymentMethods.list({
            type: "card",
            customer: customer_id,
        });

        res.status(200).json(paymentMethods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
/* ============== FOR STRIPE ============== */
