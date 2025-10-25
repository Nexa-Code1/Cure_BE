import s from "stripe";

import BookingModel from "../../../DB/models/booking.model.js";
import DoctorModel from "../../../DB/models/doctor.model.js";
import { sendEmail } from "./../../../Utils/send-email.js";
import {
    cancelBookingEmail,
    bookingEmail,
    refundConfirmationEmail,
} from "./../../../Utils/email-template.js";

const stripe = s(process.env.STRIPE_SECRET_KEY);

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await BookingModel.findAll({
            where: {
                user_id: req.user.id,
            },
            include: [
                {
                    model: DoctorModel,
                    as: "doctor",
                    attributes: ["id", "name", "specialty", "image", "address"],
                },
            ],
        });

        const formattedBookings = bookings.map((booking) => {
            let address = null;

            if (typeof booking.doctor.address === "string") {
                try {
                    address = JSON.parse(booking.doctor.address);
                } catch {
                    address = null;
                }
            } else if (
                typeof booking.doctor.address === "object" &&
                booking.doctor.address !== null
            ) {
                address = booking.doctor.address;
            }

            return {
                ...booking.dataValues,
                doctor: {
                    ...booking.doctor.dataValues,
                    address,
                },
            };
        });

        res.status(200).json({
            message: "Bookings fetched successfully",
            bookings: formattedBookings,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch bookings",
            error: error.message,
        });
    }
};

export const bookingIntent = async (req, res) => {
    try {
        const { id } = req.params;
        const { options } = req.body;

        const doctor = await DoctorModel.findOne({ where: { id } });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // CREATING PAYMENTINTENT FROM STRIPE
        const paymentIntent = await stripe.paymentIntents.create(options);

        res.status(200).json({
            message: "client secret created successfully",
            paymentIntent,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create payment intent",
            error: error.message,
        });
    }
};

export const reserveDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { day, slot, paymentIntent } = req.body;
        const user = req.user;

        if (!paymentIntent)
            return res
                .status(404)
                .json({ message: "paymentIntent is required" });

        const doctor = await DoctorModel.findOne({ where: { id } });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Parse available_slots if it's a string
        let availableSlots = doctor.available_slots;
        if (typeof availableSlots === "string") {
            availableSlots = JSON.parse(availableSlots);
        }

        if (!Array.isArray(availableSlots)) {
            return res
                .status(400)
                .json({ message: "Invalid available slots format" });
        }

        // Find the day object
        const dayIndex = availableSlots.findIndex((item) => item.day === day);
        if (dayIndex === -1) {
            return res
                .status(400)
                .json({ message: "No available slots for this day" });
        }

        // Find the slot index within the day
        const slotIndex = availableSlots[dayIndex].slots.indexOf(slot);
        if (slotIndex === -1) {
            return res.status(400).json({ message: "Slot not available" });
        }

        // Remove the reserved slot
        availableSlots[dayIndex].slots.splice(slotIndex, 1);

        // If no slots left for that day, remove the day entirely
        if (availableSlots[dayIndex].slots.length === 0) {
            availableSlots.splice(dayIndex, 1);
        }

        // Update the doctor record
        doctor.available_slots = availableSlots;
        await doctor.save();

        const booking = await BookingModel.create({
            user_id: user.id,
            doctor_id: doctor.id,
            day,
            slot,
            status: "upcoming",
            payment_intent: paymentIntent,
        });

        sendEmail.emit("SendEmail", {
            to: doctor.email,
            subject: "Booking Confirmation",
            html: bookingEmail(user.fullname, day, slot),
        });

        res.status(200).json({
            message: "Slot reserved successfully",
            booking,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to reserve slot",
            error: error.message,
        });
    }
};

export const completeBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await BookingModel.findOne({ where: { id } });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking.status = "completed";
        await booking.save();

        res.status(200).json({
            message: "Booking completed successfully",
            booking,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to complete booking",
            error: error.message,
        });
    }
};

export const cancelReserve = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await BookingModel.findOne({ where: { id } });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status === "completed") {
            return res.status(400).json({
                message: "Booking is already completed, you can't cancel it",
            });
        }

        const doctor = await DoctorModel.findOne({
            where: { id: booking.doctor_id },
        });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // STRIPE REFUND
        const refund = await stripe.refunds.create({
            payment_intent: booking.payment_intent,
        });

        // SEND EMAIL TO THE CUSTOMER WITH REFUND INFO
        console.log(req.user);
        sendEmail.emit("SendEmail", {
            to: req.user.email,
            subject: "Cure - Refund Confirmation",
            html: refundConfirmationEmail(
                req.user.fullname,
                refund.amount,
                refund.currency,
                refund.id
            ),
        });

        let availableSlots = doctor.available_slots;
        if (typeof availableSlots === "string") {
            availableSlots = JSON.parse(availableSlots);
        }
        if (!Array.isArray(availableSlots)) {
            availableSlots = [];
        }

        // Check if this day already exists
        const dayIndex = availableSlots.findIndex(
            (item) => item.day === booking.day
        );

        if (dayIndex !== -1) {
            // Add the canceled slot back
            availableSlots[dayIndex].slots.push(booking.slot);
            // Optional: sort slots in ascending order
            availableSlots[dayIndex].slots.sort();
        } else {
            // If the day doesn't exist, create a new one
            availableSlots.push({
                day: booking.day,
                slots: [booking.slot],
            });
        }

        // Update and save doctor data
        doctor.available_slots = availableSlots;
        await doctor.save();

        booking.status = "cancelled";
        await booking.save();

        sendEmail.emit("SendEmail", {
            to: doctor.email,
            subject: "Booking Cancellation",
            html: cancelBookingEmail(
                req.user.fullname,
                booking.day,
                booking.slot
            ),
        });

        res.status(200).json({
            message: "Reservation canceled successfully and slot restored",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to cancel reservation",
            error: error.message,
        });
    }
};
