import UserModel from "../../../DB/models/user.model.js";


export const register = async (req, res) => {
    try {
        const { fullname, email, password, phone, date_of_birth, gender, image, address } = req.body;

        if (!fullname || !email || !password || !phone || !date_of_birth || !gender || !image || !address) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const user = await UserModel.create({
            fullname,
            email,
            password,
            phone,
            date_of_birth,
            gender,
            image,
            address
        });
        res.status(201).json({
            message: "User registered successfully",
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}


