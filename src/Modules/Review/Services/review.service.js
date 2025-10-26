import ReviewModel from "../../../DB/models/reviews.model.js";
import DoctorModel from "../../../DB/models/doctor.model.js";
import { Sequelize } from "sequelize";

export const addReview = async (req, res) => {
  try {
    const { id: doctor_id } = req.params;
    const { rate, comment } = req.body;

    const doctor = await DoctorModel.findByPk(doctor_id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const review = await ReviewModel.create({
      rate,
      comment,
      doctor_id,
      user_id: req.user.id,
    });

    const avgData = await ReviewModel.findOne({
      where: { doctor_id },
      attributes: [[Sequelize.fn("AVG", Sequelize.col("rate")), "avgRate"]],
      raw: true,
    });

    doctor.rate = avgData.avgRate || 0;
    await doctor.save();

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add review",
      error: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rate, comment, doctor_id } = req.body;

    const review = await ReviewModel.findOne({
      where: { id, user_id: req.user.id, doctor_id },
    });

    if (!review) return res.status(404).json({ message: "Review not found" });

    review.rate = rate;
    review.comment = comment;
    await review.save();

    const avgData = await ReviewModel.findOne({
      where: { doctor_id },
      attributes: [[Sequelize.fn("AVG", Sequelize.col("rate")), "avgRate"]],
      raw: true,
    });

    await DoctorModel.update(
      { rate: avgData.avgRate || 0 },
      { where: { id: doctor_id } }
    );

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update review",
      error: error.message,
    });
  }
};
