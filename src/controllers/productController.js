import { Op, fn, col, where as sequelizeWhere } from "sequelize";
import validator from "validator";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import OrderItem from "../models/OrderItem.js";
import { ROLES } from "../constants/roles.js";
import { slugify } from "../utils/slugify.js";

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const buildPriceFilter = (minPrice, maxPrice) => {
  const min = parseNumber(minPrice);
  const max = parseNumber(maxPrice);

  if (min === null && max === null) return undefined;

  if (min !== null && max !== null) {
    return { [Op.between]: [min, max] };
  }

  if (min !== null) {
    return { [Op.gte]: min };
  }

  return { [Op.lte]: max };
};

const normalizeImages = (images = []) => {
  if (!Array.isArray(images)) return [];
  return images
    .filter((item) => typeof item === "string" && item.trim().length > 0)
    .map((url) => url.trim());
};

const buildCaseInsensitiveLike = (column, value) => {
  const normalizedValue = value.toLowerCase();
  return sequelizeWhere(fn("LOWER", col(column)), {
    [Op.like]: `%${normalizedValue}%`,
  });
};

const normalizeBoolean = (value, defaultValue) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no"].includes(normalized)) {
      return false;
    }
  }

  return defaultValue;
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      discountPercent,
      stock,
      shortDescription,
      description,
      specs,
      images,
      categoryId,
      isActive,
    } = req.body;

    if (!name || !brand || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "name, brand, price và stock là bắt buộc",
        errorCode: "MISSING_PRODUCT_FIELDS",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId là bắt buộc",
        errorCode: "MISSING_CATEGORY_ID",
      });
    }

    if (!validator.isFloat(String(price), { min: 0 })) {
      return res.status(400).json({
        success: false,
        message: "price phải là số hợp lệ và >= 0",
        errorCode: "INVALID_PRICE",
      });
    }

    if (!validator.isInt(String(stock), { min: 0 })) {
      return res.status(400).json({
        success: false,
        message: "stock phải là số nguyên hợp lệ và >= 0",
        errorCode: "INVALID_STOCK",
      });
    }

    if (
      discountPercent !== undefined &&
      !validator.isFloat(String(discountPercent), { min: 0, max: 100 })
    ) {
      return res.status(400).json({
        success: false,
        message: "discountPercent phải từ 0 đến 100",
        errorCode: "INVALID_DISCOUNT",
      });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại",
        errorCode: "CATEGORY_NOT_FOUND",
      });
    }

    const preparedImages = normalizeImages(images);
    const sanitizedImages = preparedImages.length
      ? preparedImages
      : ["https://placehold.co/600x400?text=Laptop"];

    const slug = slugify(name);
    const existingProduct = await Product.findOne({ where: { slug } });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Tên sản phẩm đã tồn tại",
        errorCode: "PRODUCT_EXISTS",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      brand: brand.trim(),
      slug,
      price,
      discountPercent: discountPercent || 0,
      stock,
      shortDescription: shortDescription?.trim() || null,
      description: description || null,
      specs: specs && typeof specs === "object" ? specs : null,
      images: sanitizedImages,
      categoryId: category.id,
      isActive: normalizeBoolean(isActive, true),
    });

    const productWithCategory = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: productWithCategory,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tạo sản phẩm",
      errorCode: "CREATE_PRODUCT_ERROR",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
    const offset = (page - 1) * limit;

    const {
      search,
      brand,
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortDir = "DESC",
      includeInactive,
    } = req.query;

    const where = {};

    const isPrivilegedUser =
      req.user && [ROLES.ADMIN, ROLES.SUPPORTER].includes(req.user.roleId);

    if (!(includeInactive === "true" && isPrivilegedUser)) {
      where.isActive = true;
    }

    if (search) {
      const term = search.trim().toLowerCase();
      where[Op.or] = [
        buildCaseInsensitiveLike("Product.name", term),
        buildCaseInsensitiveLike("Product.brand", term),
      ];
    }

    if (brand) {
      const brandTerm = brand.trim().toLowerCase();
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(buildCaseInsensitiveLike("Product.brand", brandTerm));
    }

    if (category) {
      const categoryFilter = validator.isInt(String(category))
        ? { id: Number(category) }
        : { slug: category };

      const categoryRecord = await Category.findOne({
        where: categoryFilter,
      });

      if (!categoryRecord) {
        return res.status(200).json({
          success: true,
          message: "Không tìm thấy sản phẩm",
          data: [],
          meta: {
            totalItems: 0,
            totalPages: 0,
            page,
            limit,
          },
        });
      }

      where.categoryId = categoryRecord.id;
    }

    const priceFilter = buildPriceFilter(minPrice, maxPrice);
    if (priceFilter) {
      where.price = priceFilter;
    }

    const sortMapping = {
      price: "price",
      name: "name",
      sold: "soldCount",
      createdAt: "createdAt",
    };

    const orderColumn = sortMapping[sortBy] || "createdAt";
    const orderDirection = sortDir?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
      limit,
      offset,
      order: [
        [orderColumn, orderDirection],
        ["createdAt", "DESC"],
      ],
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách sản phẩm",
      errorCode: "GET_PRODUCTS_ERROR",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const where = validator.isInt(String(productId))
      ? { id: Number(productId) }
      : { slug: productId };

    const product = await Product.findOne({
      where,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!product || (!product.isActive && (!req.user || req.user.roleId === ROLES.CUSTOMER))) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
        errorCode: "PRODUCT_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Get product detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy chi tiết sản phẩm",
      errorCode: "GET_PRODUCT_DETAIL_ERROR",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name,
      brand,
      price,
      discountPercent,
      stock,
      shortDescription,
      description,
      specs,
      images,
      categoryId,
      isActive,
    } = req.body;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
        errorCode: "PRODUCT_NOT_FOUND",
      });
    }

    if (price !== undefined && !validator.isFloat(String(price), { min: 0 })) {
      return res.status(400).json({
        success: false,
        message: "price phải là số hợp lệ và >= 0",
        errorCode: "INVALID_PRICE",
      });
    }

    if (stock !== undefined && !validator.isInt(String(stock), { min: 0 })) {
      return res.status(400).json({
        success: false,
        message: "stock phải là số nguyên hợp lệ và >= 0",
        errorCode: "INVALID_STOCK",
      });
    }

    if (
      discountPercent !== undefined &&
      !validator.isFloat(String(discountPercent), { min: 0, max: 100 })
    ) {
      return res.status(400).json({
        success: false,
        message: "discountPercent phải từ 0 đến 100",
        errorCode: "INVALID_DISCOUNT",
      });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Danh mục không tồn tại",
          errorCode: "CATEGORY_NOT_FOUND",
        });
      }
      product.categoryId = category.id;
    }

    if (name) {
      const newSlug = slugify(name);
      const duplicate = await Product.findOne({
        where: {
          slug: newSlug,
          id: { [Op.ne]: product.id },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Tên sản phẩm đã tồn tại",
          errorCode: "PRODUCT_EXISTS",
        });
      }

      product.name = name.trim();
      product.slug = newSlug;
    }

    if (brand) {
      product.brand = brand.trim();
    }

    if (price !== undefined) product.price = price;
    if (discountPercent !== undefined)
      product.discountPercent = discountPercent;
    if (stock !== undefined) product.stock = stock;
    if (shortDescription !== undefined)
      product.shortDescription = shortDescription?.trim() || null;
    if (description !== undefined) product.description = description || null;
    if (specs !== undefined && typeof specs === "object") product.specs = specs;
    if (images !== undefined) {
      const updatedImages = normalizeImages(images);
      product.images = updatedImages.length
        ? updatedImages
        : product.images;
    }
    if (isActive !== undefined)
      product.isActive = normalizeBoolean(isActive, product.isActive);

    await product.save();

    const productWithCategory = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: productWithCategory,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật sản phẩm",
      errorCode: "UPDATE_PRODUCT_ERROR",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
        errorCode: "PRODUCT_NOT_FOUND",
      });
    }

    const referencedOrderItems = await OrderItem.count({
      where: { productId: product.id },
    });

    if (referencedOrderItems > 0) {
      await product.update({ isActive: false });
      return res.status(200).json({
        success: true,
        message:
          "Sản phẩm đã được vô hiệu hóa do đang tồn tại trong đơn hàng. Không thể xóa vĩnh viễn.",
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể xóa sản phẩm",
      errorCode: "DELETE_PRODUCT_ERROR",
    });
  }
};

const getBestSellers = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 20);

    const products = await Product.findAll({
      where: { isActive: true },
      order: [["soldCount", "DESC"]],
      limit: limit,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm bán chạy thành công",
      data: products,
    });
  } catch (error) {
    console.error("Get best sellers error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách sản phẩm bán chạy",
      errorCode: "GET_BEST_SELLERS_ERROR",
    });
  }
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getBestSellers,
};
