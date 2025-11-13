import { Sequelize } from "sequelize";
require("dotenv").config();

// Cấu hình kết nối MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || "trackifi_dev",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+07:00", // Múi giờ Việt Nam
  }
);

// Kiểm tra kết nối database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected successfully");

    // Sync database trong development mode
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database synchronized");
    }
  } catch (error) {
    console.error("MySQL connection error:", error);
    process.exit(1);
  }
};

// Handle app termination
process.on("SIGINT", async () => {
  await sequelize.close();
  console.log("MySQL connection closed through app termination");
  process.exit(0);
});

export { sequelize };
export default connectDB;
