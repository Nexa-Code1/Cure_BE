import FavModel from "../../../DB/models/fav.model.js";
import DoctorModel from "../../../DB/models/doctor.model.js";

export const getFavourite = async (req, res) => {
  try {
    const user_id = req.user.id;
    const favourites = await FavModel.findAll({
      where: { user_id },
      include: {
        model: DoctorModel,
        as: "doctor",
        attributes: [
          "id",
          "name",
          "specialty",
          "image",
          "rate",
          "price",
          "is_favourite",
          "address",
          "start_time",
          "end_time",
        ],
      },
    });

    const doctors = favourites.map((fav) => fav.doctor);
    const formattedDoctors = doctors.map((doctor) => ({
      ...doctor.dataValues,
      address: JSON.parse(doctor.address || "{}"),
    }));

    res.status(200).json(formattedDoctors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get favourites", error: error.message });
  }
};

export const addFavourite = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const user_id = req.user.id;
    if (!doctor_id) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    // Check if doctor exists
    const doctor = await DoctorModel.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if already in favourites
    const existing = await FavModel.findOne({ where: { user_id, doctor_id } });
    if (existing) {
      return res.status(400).json({ message: "Doctor already in favourites" });
    }

    await FavModel.create({ user_id, doctor_id });
    await DoctorModel.update(
      { is_favourite: true },
      { where: { id: doctor_id } }
    );
    res.status(201).json({ message: "Added to favourites" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add favourite", error: error.message });
  }
};

export const deleteFavourite = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { doctor_id } = req.params;
    if (!doctor_id) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const fav = await FavModel.findOne({ where: { user_id, doctor_id } });
    if (!fav) {
      return res.status(404).json({ message: "Favourite not found" });
    }

    await fav.destroy();
    await DoctorModel.update(
      { is_favourite: false },
      { where: { id: doctor_id } }
    );
    res.status(200).json({ message: "Removed from favourites" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete favourite", error: error.message });
  }
};
