import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("cure_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

const connection = async () => {
  try {
    await sequelize.sync({
      logging: false,
      force: false,
    });
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default connection;
