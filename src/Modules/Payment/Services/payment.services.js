import s from "stripe";
import UserModel from "../../../DB/models/user.model.js";

const stripe = s(process.env.STRIPE_SECRET_KEY);

export const createSetupIntent = async (req, res) => {
  try {
    const { customer_id } = req.user;

    const customer = await stripe.customers.retrieve(customer_id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

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

    if (!pm_id) {
      return res.status(404).json({ message: "Payment method not found" });
    }

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

    if (!pm_id) {
      return res.status(404).json({ message: "Payment method not found" });
    }

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
      return res.status(404).json({ message: "Cannot find payment method" });

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

    if (!customer_id) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const customer = await stripe.customers.retrieve(customer_id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      type: "card",
      customer: customer_id,
    });

    res.status(200).json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
