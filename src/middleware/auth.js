import { verifyAccessToken } from "../utils/jwtUtils.js";
import User from "../models/User.js";

// Middleware để verify access token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token bị thiếu",
        errorCode: "TOKEN_MISSING",
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Tìm user trong database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User không tồn tại",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // Gắn user info vào request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token đã hết hạn",
        errorCode: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Access token không hợp lệ",
        errorCode: "TOKEN_INVALID",
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xác thực",
      errorCode: "AUTH_ERROR",
    });
  }
};

// Middleware để check role
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Chưa được xác thực",
        errorCode: "NOT_AUTHENTICATED",
      });
    }

    if (!allowedRoles.includes(req.user.roleId)) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
        errorCode: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
};

// Middleware cho optional authentication (không bắt buộc phải có token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findByPk(decoded.userId);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.roleId,
        };
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth,
};
