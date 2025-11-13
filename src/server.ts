const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const viewEngine = require("./config/viewEngine");
const initWebRoutes = require("./route/web");
const connectDB = require("./config/database").default;
require("dotenv").config();

const app = express();

// CORS configuration - Cho phép tất cả origins trong development
app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests không có origin (như mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Cho phép tất cả origins trong development
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

// config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);
initWebRoutes(app);

// Connect to MySQL
connectDB();

const port = parseInt(process.env.PORT || "8081", 10);

// chạy server
app.listen(port, () => {
  console.log("Backend Nodejs is running on the port: " + port);
});
