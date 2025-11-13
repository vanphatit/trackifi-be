import express from "express"; // nạp express
import bodyParser from "body-parser"; // nạp body-parser lấy tham số từ client /user?id=7
import cookieParser from "cookie-parser"; // nạp cookie-parser để xử lý cookies
import cors from "cors"; // nạp cors để xử lý CORS
import viewEngine from "./config/viewEngine"; // nạp viewEngine
import initWebRoutes from "./route/web"; // nạp file web từ Route
import connectDB from "./config/database"; // import MySQL connection
require("dotenv").config(); // gọi hàm config của dotenv để chạy lệnh process.env.PORT

let app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // Cho phép gửi cookies
  optionsSuccessStatus: 200,
};

// config app middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); // Sử dụng cookie parser

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

viewEngine(app);
initWebRoutes(app);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error:", error);
  res.status(500).json({
    success: false,
    message: "Lỗi server không xác định",
    errorCode: "INTERNAL_SERVER_ERROR",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint không tồn tại",
    errorCode: "ENDPOINT_NOT_FOUND",
  });
});

// Connect to MySQL
connectDB();

let port = process.env.PORT || 6969; // tạo tham số port lấy từ .env
// Port === undefined => port = 6969

// chạy server
app.listen(port, () => {
  // callback
  console.log("Backend Nodejs is running on the port: " + port);
  console.log(`Health check: http://localhost:${port}/health`);
});
