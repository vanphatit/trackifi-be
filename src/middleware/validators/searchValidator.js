import { query, param } from "express-validator";
import { handleValidationErrors } from "./authValidator.js";

// Search products validation
export const validateSearchProducts = [
  query("q")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Từ khóa tìm kiếm phải có từ 1-200 ký tự"),

  query("category")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Tên danh mục không được vượt quá 200 ký tự"),

  query("brand")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Thương hiệu không được vượt quá 200 ký tự"),

  query("minPrice")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Giá tối thiểu phải là số không âm"),

  query("maxPrice")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Giá tối đa phải là số không âm")
    .custom((value, { req }) => {
      if (
        req.query.minPrice &&
        parseFloat(value) < parseFloat(req.query.minPrice)
      ) {
        throw new Error("Giá tối đa phải lớn hơn giá tối thiểu");
      }
      return true;
    }),

  query("minDiscount")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage("Phần trăm giảm giá tối thiểu phải từ 0-100"),

  query("inStock")
    .optional()
    .isIn(["true", "false", "1", "0"])
    .withMessage('inStock phải là "true" hoặc "false"'),

  query("sortBy")
    .optional()
    .isIn([
      "relevance",
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
      "rating",
      "newest",
      "oldest",
      "popular",
      "stock",
    ])
    .withMessage("Tiêu chí sắp xếp không hợp lệ"),

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

// Get related products validation
export const validateGetRelatedProducts = [
  param("productId").isInt({ min: 1 }).withMessage("ID sản phẩm không hợp lệ"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Giới hạn phải từ 1-20"),

  handleValidationErrors,
];

// Autocomplete suggestions validation
export const validateAutocomplete = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Từ khóa tìm kiếm là bắt buộc")
    .isLength({ min: 2, max: 200 })
    .withMessage("Từ khóa tìm kiếm phải có từ 2-200 ký tự"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Giới hạn phải từ 1-20"),

  handleValidationErrors,
];
