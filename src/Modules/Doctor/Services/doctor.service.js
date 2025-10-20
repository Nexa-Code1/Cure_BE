import { Op } from "sequelize";
import DoctorModel from "../../../DB/models/doctor.model.js";
import ReviewModel from "../../../DB/models/reviews.model.js";
import UserModel from "../../../DB/models/user.model.js";

export const addDoctor = async (req, res) => {
  try {
    const {
      name,
      about,
      specialty,
      start_time,
      end_time,
      available_slots,
      address,
      price,
      image,
      experience,
      email,
      patients,
    } = req.body;

    const isExist = await DoctorModel.findOne({ where: { email } });
    if (isExist) {
      res.status(400).json({ message: "Email is already exist" });
      return;
    }

    const doctor = await DoctorModel.create({
      name,
      about,
      specialty,
      start_time,
      end_time,
      available_slots,
      address,
      price,
      image,
      experience,
      email,
      patients,
    });

    res.status(201).json({
      message: "Doctor added successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add doctor",
      error: error,
    });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await DoctorModel.findAll({
      attributes: [
        "id",
        "name",
        "specialty",
        "start_time",
        "end_time",
        "price",
        "image",
        "rate",
        "is_favourite",
        "address",
      ],
    });

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: doctors.map((doctor) => {
        const d = doctor.toJSON();

        // Parse address JSON if stored as string
        if (typeof d.address === "string") {
          try {
            d.address = JSON.parse(d.address);
          } catch {
            d.address = null;
          }
        }

        return d;
      }),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await DoctorModel.findOne({
      where: { id },
      include: [
        {
          model: ReviewModel,
          as: "reviews",
          attributes: ["id", "rate", "comment", "created_at"],
          include: [
            {
              model: UserModel,
              as: "user",
              attributes: ["fullname", "image"],
            },
          ],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const formattedDoctor = {
      ...doctor.dataValues,
      available_slots: JSON.parse(doctor.available_slots || "[]"),
      address: JSON.parse(doctor.address || "{}"),
      reviews: doctor.reviews,
    };

    res.status(200).json({
      message: "Doctor fetched successfully",
      doctor: formattedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctor",
      error: error.message,
    });
  }
};

export const getDoctorBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    if (!specialty) {
      return res.status(400).json({ message: "Specialty is required" });
    }
    const doctors = await DoctorModel.findAll({
      where: { specialty },
      attributes: [
        "id",
        "name",
        "specialty",
        "start_time",
        "end_time",
        "price",
        "image",
        "rate",
        "is_favourite",
        "address",
      ],
    });
    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: doctors.map((doctor) => {
        const d = doctor.toJSON();

        if (typeof d.address === "string") {
          try {
            d.address = JSON.parse(d.address);
          } catch {
            d.address = null;
          }
        }

        return d;
      }),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

export const getTopRatedDoctors = async (req, res) => {
  try {
    const doctors = await DoctorModel.findAll({
      where: {
        rate: { [Op.gte]: 3 },
      },
      attributes: [
        "id",
        "name",
        "specialty",
        "start_time",
        "end_time",
        "price",
        "image",
        "rate",
        "is_favourite",
        "address",
      ],
    });
    if (!doctors) {
      return res.status(404).json({ message: "Doctors not found" });
    }
    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: doctors.map((doctor) => {
        const d = doctor.toJSON();

        if (typeof d.address === "string") {
          try {
            d.address = JSON.parse(d.address);
          } catch {
            d.address = null;
          }
        }

        return d;
      }),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};
