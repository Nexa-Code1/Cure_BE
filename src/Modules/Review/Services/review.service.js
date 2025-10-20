import ReviewModel from "../../../DB/models/reviews.model.js";
import DoctorModel from "../../../DB/models/doctor.model.js";

export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rate, comment } = req.body;

    const doctor = await DoctorModel.findByPk(id, {
      include: [{ model: ReviewModel, as: "reviews" }],
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Create the new review
    const review = await ReviewModel.create({
      rate,
      comment,
      doctor_id: Number(id),
      user_id: req.user.id,
    });

    // Recalculate average rate
    const reviews = await ReviewModel.findAll({
      where: { doctor_id: id },
      attributes: ["rate"],
    });

    const total = reviews.reduce((sum, r) => sum + r.rate, 0);
    const avg = total / reviews.length;

    doctor.rate = avg;
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
