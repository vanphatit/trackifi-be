import express from "express"; // gọi Express
import homeController from "../controllers/homeController"; // gọi controller
import authController from "../controllers/authController"; // gọi auth controller
import { authenticateToken } from "../middleware/auth"; // gọi auth middleware
import {
  authLimiter,
  forgotPasswordLimiter,
  generalLimiter,
} from "../middleware/rateLimiter"; // gọi rate limiter

let router = express.Router(); // khởi tạo Route

let initWebRoutes = (app) => {
  // Apply general rate limiting
  app.use(generalLimiter);

  // Cách 1: định nghĩa trực tiếp trong router
  router.get("/", (req, res) => {
    return res.send("Lê Văn Phát - 22110196 - Trackifi Backend API");
  });

  // Authentication routes
  router.post("/api/auth/register", authLimiter, authController.register);
  router.post("/api/auth/login", authLimiter, authController.login);
  router.post("/api/auth/refresh-token", authController.refreshToken);
  router.post("/api/auth/logout", authenticateToken, authController.logout);
  router.post(
    "/api/auth/forgot-password",
    forgotPasswordLimiter,
    authController.forgotPassword
  );
  router.post("/api/auth/reset-password", authController.resetPassword);

  // User profile routes (protected)
  router.get("/api/user/profile", authenticateToken, authController.getProfile);
  router.put(
    "/api/user/profile",
    authenticateToken,
    authController.updateProfile
  );

  // Legacy routes (giữ lại để tương thích)
  router.get("/home", homeController.getHomePage); // url cho trang chủ
  router.get("/about", homeController.getAboutPage); // url cho trang about
  router.get("/crud", homeController.getCRUD); // url get crud
  router.post("/post-crud", homeController.postCRUD); // url post crud
  router.get("/get-crud", homeController.getFindAllCrud); // url lấy findAll
  router.get("/edit-crud", homeController.getEditCRUD); // url get editcrud
  router.post("/put-crud", homeController.putCRUD); // url put crud
  router.get("/delete-crud", homeController.deleteCRUD); // url get delete crud

  return app.use("/", router); // url mặc định
};

module.exports = initWebRoutes;
