import { body, param } from "express-validator";
import { handleValidationErrors } from "./authValidator.js";

// Add to wishlist validation
export const validateAddToWishlist = [
  body("productId")
    .notEmpty()
    .withMessage("ID sản phẩm là bắt buộc")
    .isInt({ min: 1 })
    .withMessage("ID sản phẩm không hợp lệ"),

  handleValidationErrors,
];

// Remove from wishlist validation
export const validateRemoveFromWishlist = [
  param("productId").isInt({ min: 1 }).withMessage("ID sản phẩm không hợp lệ"),

  handleValidationErrors,
];
