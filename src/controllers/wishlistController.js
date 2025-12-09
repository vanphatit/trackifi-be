import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await Wishlist.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
          attributes: [
            "id",
            "name",
            "slug",
            "price",
            "discountPercent",
            "images",
            "stock",
            "ratingAverage",
          ],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu thích thành công",
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách yêu thích",
      errorCode: "GET_WISHLIST_ERROR",
    });
  }
};

const addToWishlist = async (req, res) => {
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

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
        errorCode: "PRODUCT_NOT_FOUND",
      });
    }

    const [item, created] = await Wishlist.findOrCreate({
      where: { userId, productId },
    });

    if (!created) {
      return res.status(200).json({
        success: true,
        message: "Sản phẩm đã có trong danh sách yêu thích",
        data: item,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Thêm vào danh sách yêu thích thành công",
      data: item,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thêm vào danh sách yêu thích",
      errorCode: "ADD_WISHLIST_ERROR",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const deletedCount = await Wishlist.destroy({
      where: { userId, productId },
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không có trong danh sách yêu thích",
        errorCode: "WISHLIST_ITEM_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa khỏi danh sách yêu thích thành công",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa khỏi danh sách yêu thích",
      errorCode: "REMOVE_WISHLIST_ERROR",
    });
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
