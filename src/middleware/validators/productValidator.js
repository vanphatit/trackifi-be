import { body, param, validationResult } from "express-validator";
import { handleValidationErrors } from "./authValidator.js";

// Create product validation
export const validateCreateProduct = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên sản phẩm là bắt buộc")
    .isLength({ min: 3, max: 200 })
    .withMessage("Tên sản phẩm phải có từ 3-200 ký tự"),

  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Thương hiệu là bắt buộc")
    .isLength({ min: 1, max: 120 })
    .withMessage("Thương hiệu phải có từ 1-120 ký tự"),

  body("price")
    .notEmpty()
    .withMessage("Giá là bắt buộc")
    .isFloat({ min: 0 })
    .withMessage("Giá phải là số dương"),

  body("discountPercent")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Phần trăm giảm giá phải từ 0-100"),

  body("stock")
    .notEmpty()
    .withMessage("Số lượng là bắt buộc")
    .isInt({ min: 0 })
    .withMessage("Số lượng phải là số nguyên không âm"),

  body("categoryId")
    .notEmpty()
    .withMessage("Danh mục là bắt buộc")
    .isInt({ min: 1 })
    .withMessage("ID danh mục không hợp lệ"),

  body("shortDescription")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Mô tả ngắn không được vượt quá 500 ký tự"),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 10000 })
    .withMessage("Mô tả không được vượt quá 10000 ký tự"),

  body("images")
    .isArray({ min: 1 })
    .withMessage("Phải có ít nhất một hình ảnh"),

  body("images.*").trim().isURL().withMessage("URL hình ảnh không hợp lệ"),

  body("specs")
    .optional()
    .isObject()
    .withMessage("Thông số kỹ thuật phải là object"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là boolean"),

  handleValidationErrors,
];

// Update product validation
export const validateUpdateProduct = [
  param("productId").isInt({ min: 1 }).withMessage("ID sản phẩm không hợp lệ"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên sản phẩm không được để trống")
    .isLength({ min: 3, max: 200 })
    .withMessage("Tên sản phẩm phải có từ 3-200 ký tự"),

  body("brand")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Thương hiệu không được để trống")
    .isLength({ min: 1, max: 120 })
    .withMessage("Thương hiệu phải có từ 1-120 ký tự"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Giá phải là số dương"),

  body("discountPercent")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Phần trăm giảm giá phải từ 0-100"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Số lượng phải là số nguyên không âm"),

  body("categoryId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID danh mục không hợp lệ"),

  body("shortDescription")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Mô tả ngắn không được vượt quá 500 ký tự"),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 10000 })
    .withMessage("Mô tả không được vượt quá 10000 ký tự"),

  body("images")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Phải có ít nhất một hình ảnh"),

  body("images.*")
    .optional()
    .trim()
    .isURL()
    .withMessage("URL hình ảnh không hợp lệ"),

  body("specs")
    .optional()
    .isObject()
    .withMessage("Thông số kỹ thuật phải là object"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive phải là boolean"),

  handleValidationErrors,
];

// Delete product validation
export const validateProductId = [
  param("productId").isInt({ min: 1 }).withMessage("ID sản phẩm không hợp lệ"),

  handleValidationErrors,
];

// Get product detail validation
export const validateGetProduct = [
  param("productId").isInt({ min: 1 }).withMessage("ID sản phẩm không hợp lệ"),

  handleValidationErrors,
];
