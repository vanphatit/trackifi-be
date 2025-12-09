import rateLimit from "express-rate-limit";

// Rate limiting cho authentication endpoints
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 phút
  max: 200, // Tối đa 20 attempts trong 15 phút (tăng từ 5 để dễ dev)
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
  max: 10, // Tối đa 10 lần forgot password trong 1 giờ (tăng từ 3)
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
  windowMs: 1 * 60 * 1000, // 1 phút (giảm từ 15 phút để reset nhanh hơn)
  max: 1000, // Tối đa 1000 requests trong 1 phút (tăng từ 100/15min)
  message: {
    success: false,
    message: "Quá nhiều requests, vui lòng thử lại sau",
    errorCode: "TOO_MANY_REQUESTS",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { authLimiter, forgotPasswordLimiter, generalLimiter };
