import express, { Application } from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/database";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();

// config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);
initWebRoutes(app);

// Connect to MongoDB
connectDB();

const port: number = parseInt(process.env.PORT || "6969", 10);

// chạy server
app.listen(port, () => {
  console.log("Backend Nodejs is running on the port: " + port);
});
