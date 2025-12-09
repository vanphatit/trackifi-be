import { body, param } from "express-validator";
import { handleValidationErrors } from "./authValidator.js";

// Create category validation
export const validateCreateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên danh mục là bắt buộc")
    .isLength({ min: 2, max: 150 })
    .withMessage("Tên danh mục phải có từ 2-150 ký tự"),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Mô tả không được vượt quá 1000 ký tự"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là boolean"),

  handleValidationErrors,
];

// Update category validation
export const validateUpdateCategory = [
  param("categoryId").isInt({ min: 1 }).withMessage("ID danh mục không hợp lệ"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên danh mục không được để trống")
    .isLength({ min: 2, max: 150 })
    .withMessage("Tên danh mục phải có từ 2-150 ký tự"),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Mô tả không được vượt quá 1000 ký tự"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là boolean"),

  handleValidationErrors,
];

// Delete category validation
export const validateCategoryId = [
  param("categoryId").isInt({ min: 1 }).withMessage("ID danh mục không hợp lệ"),

  handleValidationErrors,
];
