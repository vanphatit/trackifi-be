import { body, param, query } from "express-validator";
import { handleValidationErrors } from "./authValidator.js";

// Create review validation
export const validateCreateReview = [
  body("productId")
    .notEmpty()
    .withMessage("ID sản phẩm là bắt buộc")
    .isInt({ min: 1 })
    .withMessage("ID sản phẩm không hợp lệ"),

  body("rating")
    .notEmpty()
    .withMessage("Đánh giá là bắt buộc")
    .isInt({ min: 1, max: 5 })
    .withMessage("Đánh giá phải từ 1 đến 5 sao"),

  body("comment")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Bình luận phải có từ 10-1000 ký tự"),

  handleValidationErrors,
];

// Update review validation
export const validateUpdateReview = [
  param("reviewId").isInt({ min: 1 }).withMessage("ID đánh giá không hợp lệ"),

  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Đánh giá phải từ 1 đến 5 sao"),

  body("comment")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Bình luận phải có từ 10-1000 ký tự"),

  handleValidationErrors,
];

// Delete review validation
export const validateReviewId = [
  param("reviewId").isInt({ min: 1 }).withMessage("ID đánh giá không hợp lệ"),

  handleValidationErrors,
];

// Get reviews for product
export const validateGetProductReviews = [
  param("productId").isInt({ min: 1 }).withMessage("ID sản phẩm không hợp lệ"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Trang phải là số nguyên dương"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Giới hạn phải từ 1-100"),

  handleValidationErrors,
];
