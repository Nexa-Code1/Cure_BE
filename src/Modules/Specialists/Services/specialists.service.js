export const specialists = [
  "Dentist",
  "Cardiologist",
  "ENT",
  "Neurologist",
  "General Practitioner",
  "Ophthalmologist",
  "Pulmonologist",
  "Orthopedic",
  "Gastroenterologist",
  "Oncologist",
  "Endocrinologist",
  "Psychiatrist",
];

export const getSpecialists = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Specialists fetched successfully",
      specialists,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch specialists",
      error: error.message,
    });
  }
};
