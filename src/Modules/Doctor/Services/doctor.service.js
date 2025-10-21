import { Op, Sequelize } from "sequelize";
import DoctorModel from "../../../DB/models/doctor.model.js";
import ReviewModel from "../../../DB/models/reviews.model.js";
import UserModel from "../../../DB/models/user.model.js";
import FavModel from "../../../DB/models/fav.model.js";

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
      gender,
    } = req.body;

    const isExist = await DoctorModel.findOne({ where: { email } });
    if (isExist) {
      return res.status(400).json({ message: "Email already exists" });
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
      gender,
    });

    res.status(201).json({
      message: "Doctor added successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add doctor",
      error: error.message,
    });
  }
};

const attachFavourites = async (doctors, user_id) => {
  if (!user_id)
    return doctors.map((d) => ({ ...d.toJSON(), is_favourite: false }));

  const favs = await FavModel.findAll({
    where: { user_id },
    attributes: ["doctor_id"],
  });
  const favIds = favs.map((f) => f.doctor_id);

  return doctors.map((doctor) => {
    const d = doctor.toJSON();
    d.is_favourite = favIds.includes(d.id);

    if (typeof d.address === "string") {
      try {
        d.address = JSON.parse(d.address);
      } catch {
        d.address = null;
      }
    }

    if (doctor.available_slots && typeof doctor.available_slots === "string") {
      try {
        d.available_slots = JSON.parse(doctor.available_slots);
      } catch {
        d.available_slots = [];
      }
    }

    return d;
  });
};

export const getDoctors = async (req, res) => {
  try {
    const {
      limit = 10,
      offset = 0,
      doctorName = "",
      sort = "",
      gender,
      available,
    } = req.query;

    const availableDays = available
      ? available.split(",").map((d) => d.trim())
      : [];

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const formattedToday = today.toISOString().split("T")[0];
    const formattedTomorrow = tomorrow.toISOString().split("T")[0];

    const whereConditions = {};
    if (doctorName) whereConditions.name = { [Op.like]: `%${doctorName}%` };
    if (gender) whereConditions.gender = gender;

    if (availableDays.length > 0) {
      const jsonConditions = availableDays.map((day) => {
        const formattedDate =
          day === "tomorrow" ? formattedTomorrow : formattedToday;
        return Sequelize.where(
          Sequelize.fn(
            "JSON_SEARCH",
            Sequelize.col("available_slots"),
            "one",
            formattedDate
          ),
          { [Op.not]: null }
        );
      });
      whereConditions[Op.or] = jsonConditions;
    }

    let order = [];
    if (sort === "price_asc") order = [["price", "ASC"]];
    else if (sort === "price_desc") order = [["price", "DESC"]];
    else if (sort === "recommend") order = [["rate", "DESC"]];

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
        "address",
        "gender",
        "available_slots",
      ],
      where: {
        ...whereConditions,
        ...(sort === "recommend" && { rate: { [Op.gte]: 3 } }),
      },
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const formattedDoctors = await attachFavourites(doctors, req.user?.id);

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: formattedDoctors,
    });
  } catch (error) {
    console.error("Get Doctors Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch doctors", error: error.message });
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
            { model: UserModel, as: "user", attributes: ["fullname", "image"] },
          ],
        },
      ],
    });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const formattedDoctorArray = await attachFavourites([doctor], req.user?.id);
    const formattedDoctor = {
      ...formattedDoctorArray[0],
      reviews: doctor.reviews,
    };

    res.status(200).json({
      message: "Doctor fetched successfully",
      doctor: formattedDoctor,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch doctor", error: error.message });
  }
};

export const getDoctorBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    if (!specialty)
      return res.status(400).json({ message: "Specialty is required" });

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
        "address",
      ],
    });

    const formattedDoctors = await attachFavourites(doctors, req.user?.id);

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: formattedDoctors,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch doctors", error: error.message });
  }
};

export const getTopRatedDoctors = async (req, res) => {
  try {
    const doctors = await DoctorModel.findAll({
      where: { rate: { [Op.gte]: 3 } },
      attributes: [
        "id",
        "name",
        "specialty",
        "start_time",
        "end_time",
        "price",
        "image",
        "rate",
        "address",
      ],
    });

    if (!doctors || doctors.length === 0) {
      return res
        .status(404)
        .json({ message: "No doctors found with rate >= 3" });
    }

    const formattedDoctors = await attachFavourites(doctors, req.user?.id);

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: formattedDoctors,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch doctors", error: error.message });
  }
};
