import { Op, fn, col } from "sequelize";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { slugify } from "../utils/slugify.js";
import { ROLES } from "../constants/roles.js";

const normalizeBoolean = (value, defaultValue) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return value === "true" || value === "1";
};

const createCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Tên danh mục phải có ít nhất 2 ký tự",
        errorCode: "INVALID_CATEGORY_NAME",
      });
    }

    const slug = slugify(name);
    const existingCategory = await Category.findOne({
      where: {
        [Op.or]: [{ name: name.trim() }, { slug }],
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Danh mục đã tồn tại",
        errorCode: "CATEGORY_EXISTS",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || null,
      slug,
      isActive: normalizeBoolean(isActive, true),
    });

    return res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tạo danh mục",
      errorCode: "CREATE_CATEGORY_ERROR",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const canViewInactive =
      req.user && [ROLES.ADMIN, ROLES.SUPPORTER].includes(req.user.roleId);
    const includeInactive =
      normalizeBoolean(req.query.includeInactive, false) && canViewInactive;

    const categories = await Category.findAll({
      where: includeInactive ? {} : { isActive: true },
      order: [["name", "ASC"]],
    });

    let counts = [];

    if (categories.length > 0) {
      counts = await Product.findAll({
        attributes: [
          "categoryId",
          [fn("COUNT", col("Product.id")), "productCount"],
        ],
        where: {
          categoryId: categories.map((c) => c.id),
        },
        group: ["categoryId"],
        raw: true,
      });
    }

    const countMap = counts.reduce((acc, curr) => {
      acc[curr.categoryId] = Number(curr.productCount);
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục thành công",
      data: categories.map((category) => ({
        ...category.toJSON(),
        productCount: countMap[category.id] || 0,
      })),
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách danh mục",
      errorCode: "GET_CATEGORIES_ERROR",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại",
        errorCode: "CATEGORY_NOT_FOUND",
      });
    }

    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Tên danh mục phải có ít nhất 2 ký tự",
        errorCode: "INVALID_CATEGORY_NAME",
      });
    }

    if (name && name.trim() !== category.name) {
      const slug = slugify(name);
      const existingCategory = await Category.findOne({
        where: {
          [Op.or]: [{ name: name.trim() }, { slug }],
          id: { [Op.ne]: category.id },
        },
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Danh mục đã tồn tại",
          errorCode: "CATEGORY_EXISTS",
        });
      }

      category.slug = slug;
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description?.trim() || null;
    }

    if (isActive !== undefined) {
      category.isActive = normalizeBoolean(isActive, category.isActive);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật danh mục",
      errorCode: "UPDATE_CATEGORY_ERROR",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại",
        errorCode: "CATEGORY_NOT_FOUND",
      });
    }

    const productCount = await Product.count({
      where: { categoryId: category.id },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xóa danh mục vì đang có sản phẩm liên quan. Vui lòng chuyển sản phẩm sang danh mục khác trước.",
        errorCode: "CATEGORY_HAS_PRODUCTS",
      });
    }

    await category.destroy();

    return res.status(200).json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể xóa danh mục",
      errorCode: "DELETE_CATEGORY_ERROR",
    });
  }
};

export default {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
