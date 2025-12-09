import RecentlyViewed from "../models/RecentlyViewed.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { Op } from "sequelize";

// Track product view
const trackView = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ProductId là bắt buộc",
        errorCode: "PRODUCT_ID_REQUIRED",
      });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
        errorCode: "PRODUCT_NOT_FOUND",
      });
    }

    // Check if view exists, update viewedAt if exists, create if not
    const [viewRecord, created] = await RecentlyViewed.findOrCreate({
      where: { userId, productId },
      defaults: { viewedAt: new Date() },
    });

    if (!created) {
      // Update viewedAt to current time
      viewRecord.viewedAt = new Date();
      await viewRecord.save();
    }

    // Clean up old views - keep only last 50 per user
    const allViews = await RecentlyViewed.findAll({
      where: { userId },
      order: [["viewedAt", "DESC"]],
      attributes: ["id"],
    });

    if (allViews.length > 50) {
      const viewsToDelete = allViews.slice(50).map((v) => v.id);
      await RecentlyViewed.destroy({
        where: {
          id: { [Op.in]: viewsToDelete },
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã ghi nhận lượt xem sản phẩm",
      data: viewRecord,
    });
  } catch (error) {
    console.error("Track view error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi ghi nhận lượt xem",
      errorCode: "TRACK_VIEW_ERROR",
    });
  }
};

// Get recently viewed products
const getRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const recentViews = await RecentlyViewed.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
          where: { isActive: true },
          attributes: [
            "id",
            "name",
            "slug",
            "price",
            "discountPercent",
            "images",
            "stock",
            "ratingAverage",
            "brand",
          ],
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name", "slug"],
            },
          ],
        },
      ],
      order: [["viewedAt", "DESC"]],
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm đã xem thành công",
      data: recentViews.map((rv) => ({
        ...rv.product.toJSON(),
        viewedAt: rv.viewedAt,
      })),
      meta: {
        totalItems: recentViews.length,
        limit,
      },
    });
  } catch (error) {
    console.error("Get recently viewed error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sản phẩm đã xem",
      errorCode: "GET_RECENTLY_VIEWED_ERROR",
    });
  }
};

// Clear recently viewed history
const clearRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user.id;

    await RecentlyViewed.destroy({
      where: { userId },
    });

    return res.status(200).json({
      success: true,
      message: "Đã xóa lịch sử xem sản phẩm",
    });
  } catch (error) {
    console.error("Clear recently viewed error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa lịch sử xem",
      errorCode: "CLEAR_RECENTLY_VIEWED_ERROR",
    });
  }
};

export default {
  trackView,
  getRecentlyViewed,
  clearRecentlyViewed,
};
