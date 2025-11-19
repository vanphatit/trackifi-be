import { Sequelize } from "sequelize";
require("dotenv").config();

// Cấu hình kết nối MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || "trackifi_dev",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "123456",
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
    // Thử kết nối trước
    await sequelize.authenticate();
    console.log("MySQL connected successfully");

    // Sync database trong development mode
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database synchronized");
    }
  } catch (error) {
    if (error.parent && error.parent.code === "ER_BAD_DB_ERROR") {
      console.log("Database does not exist, creating...");
      try {
        // Tạo connection không chỉ định database để tạo database mới
        const { Sequelize } = require("sequelize");
        const tempSequelize = new Sequelize(
          "", // không chỉ định database
          process.env.DB_USER || "root",
          process.env.DB_PASSWORD || "123456",
          {
            host: process.env.DB_HOST || "localhost",
            port: process.env.DB_PORT || 3306,
            dialect: "mysql",
            logging: false,
          }
        );

        // Tạo database
        await tempSequelize.query(
          `CREATE DATABASE IF NOT EXISTS \`${
            process.env.DB_NAME || "trackifi_dev"
          }\`;`
        );
        console.log(
          `Database ${
            process.env.DB_NAME || "trackifi_dev"
          } created successfully`
        );

        // Đóng connection tạm
        await tempSequelize.close();

        // Thử kết nối lại với database mới
        await sequelize.authenticate();
        console.log("MySQL connected successfully after creating database");

        // Sync database
        if (process.env.NODE_ENV === "development") {
          await sequelize.sync({ alter: true });
          console.log("Database synchronized");
        }
      } catch (createError) {
        console.error("Error creating database:", createError);
        process.exit(1);
      }
    } else {
      console.error("MySQL connection error:", error);
      process.exit(1);
    }
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
