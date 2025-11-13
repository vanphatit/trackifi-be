import rateLimit from "express-rate-limit";

// Rate limiting cho authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 attempts trong 15 phút
  message: {
    success: false,
    message: "Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút",
    errorCode: "TOO_MANY_REQUESTS",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Không đếm request thành công
});

// Rate limiting cho forgot password
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Tối đa 3 lần forgot password trong 1 giờ
  message: {
    success: false,
    message: "Quá nhiều lần yêu cầu reset password, vui lòng thử lại sau 1 giờ",
    errorCode: "TOO_MANY_REQUESTS",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting chung cho API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 requests trong 15 phút
  message: {
    success: false,
    message: "Quá nhiều requests, vui lòng thử lại sau",
    errorCode: "TOO_MANY_REQUESTS",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  forgotPasswordLimiter,
  generalLimiter,
};
