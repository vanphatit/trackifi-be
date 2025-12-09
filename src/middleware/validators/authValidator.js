import { body, param, query, validationResult } from "express-validator";

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// Register validation
export const validateRegister = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email không được vượt quá 255 ký tự"),

  body("password")
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
    .isLength({ max: 255 })
    .withMessage("Mật khẩu không được vượt quá 255 ký tự")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Mật khẩu phải chứa ít nhất một chữ thường, một chữ hoa và một số"
    ),

  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("Họ là bắt buộc")
    .isLength({ min: 1, max: 255 })
    .withMessage("Họ phải có từ 1-255 ký tự")
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage("Họ chỉ được chứa chữ cái và khoảng trắng"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Tên là bắt buộc")
    .isLength({ min: 1, max: 255 })
    .withMessage("Tên phải có từ 1-255 ký tự")
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage("Tên chỉ được chứa chữ cái và khoảng trắng"),

  body("phoneNumber")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(\+84|0)[0-9]{9,10}$/)
    .withMessage(
      "Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx)"
    ),

  body("gender")
    .optional()
    .isBoolean()
    .withMessage("Giới tính phải là true (Nam) hoặc false (Nữ)"),

  body("address")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Địa chỉ không được vượt quá 1000 ký tự"),

  handleValidationErrors,
];

// Login validation
export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Mật khẩu là bắt buộc"),

  handleValidationErrors,
];

// Forgot password validation
export const validateForgotPassword = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  handleValidationErrors,
];

// Reset password validation
export const validateResetPassword = [
  body("token").trim().notEmpty().withMessage("Token là bắt buộc"),

  body("newPassword")
    .notEmpty()
    .withMessage("Mật khẩu mới là bắt buộc")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Mật khẩu phải chứa ít nhất một chữ thường, một chữ hoa và một số"
    ),

  handleValidationErrors,
];

// Change password validation
export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Mật khẩu hiện tại là bắt buộc"),

  body("newPassword")
    .notEmpty()
    .withMessage("Mật khẩu mới là bắt buộc")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Mật khẩu phải chứa ít nhất một chữ thường, một chữ hoa và một số"
    )
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("Mật khẩu mới phải khác mật khẩu hiện tại");
      }
      return true;
    }),

  handleValidationErrors,
];

// Update profile validation
export const validateUpdateProfile = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Họ không được để trống")
    .isLength({ min: 1, max: 255 })
    .withMessage("Họ phải có từ 1-255 ký tự")
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage("Họ chỉ được chứa chữ cái và khoảng trắng"),

  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên không được để trống")
    .isLength({ min: 1, max: 255 })
    .withMessage("Tên phải có từ 1-255 ký tự")
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage("Tên chỉ được chứa chữ cái và khoảng trắng"),

  body("phoneNumber")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(\+84|0)[0-9]{9,10}$/)
    .withMessage(
      "Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx)"
    ),

  body("gender")
    .optional()
    .isBoolean()
    .withMessage("Giới tính phải là true (Nam) hoặc false (Nữ)"),

  body("address")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Địa chỉ không được vượt quá 1000 ký tự"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  handleValidationErrors,
];
