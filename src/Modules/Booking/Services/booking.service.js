import BookingModel from "../../../DB/models/booking.model.js";
import DoctorModel from "../../../DB/models/doctor.model.js";
import { sendEmail } from "./../../../Utils/send-email.js";
import {
  cancelBookingEmail,
  bookingEmail,
} from "./../../../Utils/email-template.js";

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

    const formattedBookings = bookings.map((booking) => ({
      ...booking.dataValues,
      doctor: {
        ...booking.doctor.dataValues,
        address: JSON.parse(booking.doctor.address || "{}"),
      },
    }));

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

export const reserveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, slot } = req.body;
    const user = req.user;

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

export const cancelReserve = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await BookingModel.findOne({ where: { id } });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const doctor = await DoctorModel.findOne({
      where: { id: booking.doctor_id },
    });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

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

    await booking.destroy();

    sendEmail.emit("SendEmail", {
      to: doctor.email,
      subject: "Booking Cancellation",
      html: cancelBookingEmail(req.user.fullname, booking.day, booking.slot),
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
