import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: "mysql",
    logging: false,
});

const connection = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ logging: false });
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

export default connection;
