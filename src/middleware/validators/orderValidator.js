import { body, param } from "express-validator";
import { handleValidationErrors } from "./authValidator.js";

// Create order validation
export const validateCreateOrder = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Đơn hàng phải có ít nhất một sản phẩm"),

  body("items.*.productId")
    .isInt({ min: 1 })
    .withMessage("ID sản phẩm không hợp lệ"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Số lượng phải là số nguyên dương"),

  body("recipientName")
    .trim()
    .notEmpty()
    .withMessage("Tên người nhận là bắt buộc")
    .isLength({ min: 3, max: 100 })
    .withMessage("Tên người nhận phải có từ 3-100 ký tự")
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage("Tên người nhận chỉ được chứa chữ cái và khoảng trắng"),

  body("shippingAddress")
    .trim()
    .notEmpty()
    .withMessage("Địa chỉ giao hàng là bắt buộc")
    .isLength({ min: 10, max: 500 })
    .withMessage("Địa chỉ giao hàng phải có từ 10-500 ký tự"),

  body("contactPhone")
    .trim()
    .notEmpty()
    .withMessage("Số điện thoại liên hệ là bắt buộc")
    .matches(/^(\+84|0)[0-9]{9,10}$/)
    .withMessage(
      "Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx)"
    ),

  body("paymentMethod")
    .optional()
    .isIn(["COD", "BANK_TRANSFER"])
    .withMessage('Phương thức thanh toán phải là "COD" hoặc "BANK_TRANSFER"'),

  body("notes")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Ghi chú không được vượt quá 500 ký tự"),

  handleValidationErrors,
];

// Update order status validation
export const validateUpdateOrderStatus = [
  param("orderId").isInt({ min: 1 }).withMessage("ID đơn hàng không hợp lệ"),

  body("status")
    .notEmpty()
    .withMessage("Trạng thái là bắt buộc")
    .isIn([
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "COMPLETED",
      "CANCELLED",
    ])
    .withMessage("Trạng thái không hợp lệ"),

  handleValidationErrors,
];

// Get order validation
export const validateOrderId = [
  param("orderId").isInt({ min: 1 }).withMessage("ID đơn hàng không hợp lệ"),

  handleValidationErrors,
];
