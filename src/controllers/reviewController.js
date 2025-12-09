import Review from "../models/Review.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import { ROLES } from "../constants/roles.js";

const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Đánh giá phải từ 1 đến 5 sao",
        errorCode: "INVALID_RATING",
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
        errorCode: "PRODUCT_NOT_FOUND",
      });
    }

    // Optional: Check if user bought product
    // const hasPurchased = await Order.findOne({
    //   where: { userId, status: "COMPLETED" },
    //   include: [{ model: OrderItem, as: "items", where: { productId } }],
    // });
    // if (!hasPurchased) return res.status(403)...

    const review = await Review.create({
      userId,
      productId,
      rating,
      comment: comment?.trim(),
    });

    // Update product average rating (simplified)
    // Ideally use a background job or trigger
    const reviews = await Review.findAll({ where: { productId } });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await product.update({
      ratingAverage: avgRating,
      ratingCount: reviews.length,
    });

    return res.status(201).json({
      success: true,
      message: "Đánh giá thành công",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đánh giá",
      errorCode: "CREATE_REVIEW_ERROR",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await Review.findAndCountAll({
      where: { productId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "image"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đánh giá thành công",
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy đánh giá",
      errorCode: "GET_REVIEWS_ERROR",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Đánh giá không tồn tại",
        errorCode: "REVIEW_NOT_FOUND",
      });
    }

    const isOwner = review.userId === req.user.id;
    const isAdmin = [ROLES.ADMIN, ROLES.SUPPORTER].includes(req.user.roleId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá này",
        errorCode: "DELETE_REVIEW_FORBIDDEN",
      });
    }

    await review.destroy();

    // Recalculate rating
    const productId = review.productId;
    const reviews = await Review.findAll({ where: { productId } });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    await Product.update(
      { ratingAverage: avgRating, ratingCount: reviews.length },
      { where: { id: productId } }
    );

    return res.status(200).json({
      success: true,
      message: "Xóa đánh giá thành công",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa đánh giá",
      errorCode: "DELETE_REVIEW_ERROR",
    });
  }
};

export default {
  createReview,
  getProductReviews,
  deleteReview,
};
