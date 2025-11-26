import express from "express"; // gọi Express
import homeController from "../controllers/homeController"; // gọi controller
import authController from "../controllers/authController"; // gọi auth controller
import productController from "../controllers/productController";
import categoryController from "../controllers/categoryController";
import orderController from "../controllers/orderController";
import userController from "../controllers/userController";
import searchController from "../controllers/searchController";
import {
  authenticateToken,
  requireRole,
  optionalAuth,
} from "../middleware/auth"; // gọi auth middleware
import {
  authLimiter,
  forgotPasswordLimiter,
  generalLimiter,
} from "../middleware/rateLimiter"; // gọi rate limiter
import { syncProductToElasticsearch } from "../middleware/elasticsearchSync";
import { ROLES } from "../constants/roles.js";

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

  // Category routes
  router.get("/api/categories", optionalAuth, categoryController.getCategories);
  router.post(
    "/api/categories",
    authenticateToken,
    requireRole([ROLES.ADMIN, ROLES.SUPPORTER]),
    categoryController.createCategory
  );
  router.put(
    "/api/categories/:categoryId",
    authenticateToken,
    requireRole([ROLES.ADMIN, ROLES.SUPPORTER]),
    categoryController.updateCategory
  );
  router.delete(
    "/api/categories/:categoryId",
    authenticateToken,
    requireRole([ROLES.ADMIN]),
    categoryController.deleteCategory
  );

  // Search routes (Elasticsearch-powered)
  router.post(
    "/api/search/products",
    optionalAuth,
    searchController.searchProducts
  );
  router.get(
    "/api/search/autocomplete",
    searchController.getAutocompleteSuggestions
  );
  router.get(
    "/api/search/related/:productId",
    searchController.getRelatedProducts
  );
  router.get(
    "/api/search/popular-terms",
    searchController.getPopularSearchTerms
  );
  router.get("/api/search/filters", searchController.getSearchFilters);

  // Product routes
  router.get("/api/products", optionalAuth, productController.getProducts);
  router.get(
    "/api/products/:productId",
    optionalAuth,
    productController.getProductById
  );
  router.post(
    "/api/products",
    authenticateToken,
    requireRole([ROLES.ADMIN, ROLES.SUPPORTER]),
    syncProductToElasticsearch("create"),
    productController.createProduct
  );
  router.put(
    "/api/products/:productId",
    authenticateToken,
    requireRole([ROLES.ADMIN, ROLES.SUPPORTER]),
    syncProductToElasticsearch("update"),
    productController.updateProduct
  );
  router.delete(
    "/api/products/:productId",
    authenticateToken,
    requireRole([ROLES.ADMIN]),
    syncProductToElasticsearch("delete"),
    productController.deleteProduct
  );

  // Order routes
  router.post(
    "/api/orders",
    authenticateToken,
    requireRole([ROLES.CUSTOMER, ROLES.ADMIN, ROLES.SUPPORTER]),
    orderController.createOrder
  );
  router.get("/api/orders/my", authenticateToken, orderController.getMyOrders);
  router.get(
    "/api/orders",
    authenticateToken,
    requireRole([ROLES.ADMIN, ROLES.SUPPORTER]),
    orderController.getAllOrders
  );
  router.get(
    "/api/orders/:orderId",
    authenticateToken,
    orderController.getOrderDetail
  );
  router.patch(
    "/api/orders/:orderId/status",
    authenticateToken,
    requireRole([ROLES.ADMIN, ROLES.SUPPORTER]),
    orderController.updateOrderStatus
  );

  // User management routes
  router.get(
    "/api/admin/users",
    authenticateToken,
    requireRole([ROLES.ADMIN, ROLES.SUPPORTER]),
    userController.listUsers
  );
  router.patch(
    "/api/admin/users/:userId/role",
    authenticateToken,
    requireRole([ROLES.ADMIN]),
    userController.updateUserRole
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
