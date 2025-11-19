import { Op } from "sequelize";
import Order, { ORDER_STATUSES } from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sequelize } from "../config/database.js";
import { ROLES } from "../constants/roles.js";

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 10, 100);
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const buildOrderInclude = () => [
  {
    model: OrderItem,
    as: "items",
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "name", "slug", "images"],
      },
    ],
  },
  {
    model: User,
    as: "customer",
    attributes: ["id", "email", "firstName", "lastName"],
  },
];

const calculateProductPrice = (product) => {
  const discountMultiplier = 1 - Number(product.discountPercent || 0) / 100;
  return Number(product.price) * discountMultiplier;
};

const resolveShippingFee = () => {
  const envFee = Number(process.env.DEFAULT_SHIPPING_FEE);
  return Number.isFinite(envFee) ? envFee : 50000;
};

const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      contactPhone,
      paymentMethod,
      notes,
      items,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách sản phẩm không được bỏ trống",
        errorCode: "ORDER_ITEMS_REQUIRED",
      });
    }

    const normalizedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }));

    const invalidItem = normalizedItems.find(
      (item) =>
        !Number.isInteger(item.productId) ||
        item.productId <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
    );

    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message: "productId và quantity phải là số nguyên hợp lệ",
        errorCode: "INVALID_ORDER_ITEM",
      });
    }

    if (!shippingAddress || shippingAddress.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Địa chỉ giao hàng phải có ít nhất 10 ký tự",
        errorCode: "INVALID_SHIPPING_ADDRESS",
      });
    }

    if (!contactPhone || contactPhone.trim().length < 8) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại liên hệ không hợp lệ",
        errorCode: "INVALID_CONTACT_PHONE",
      });
    }

    const productIds = normalizedItems.map((item) => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    const missingProduct = normalizedItems.find(
      (item) => !productMap.has(item.productId)
    );

    if (missingProduct) {
      return res.status(400).json({
        success: false,
        message: "Một hoặc nhiều sản phẩm không tồn tại",
        errorCode: "PRODUCT_NOT_FOUND",
      });
    }

    const inactiveProduct = products.find((product) => !product.isActive);
    if (inactiveProduct) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm ${inactiveProduct.name} đang tạm ngưng kinh doanh`,
        errorCode: "PRODUCT_INACTIVE",
      });
    }

    const outOfStockProduct = normalizedItems.find((item) => {
      const product = productMap.get(item.productId);
      return item.quantity > product.stock;
    });

    if (outOfStockProduct) {
      return res.status(400).json({
        success: false,
        message: "Không đủ tồn kho cho một trong các sản phẩm",
        errorCode: "INSUFFICIENT_STOCK",
      });
    }

    const transaction = await sequelize.transaction();

    try {
      let subtotal = 0;

      const orderItemsPayload = normalizedItems.map((item) => {
        const product = productMap.get(item.productId);
        const quantity = parseInt(item.quantity, 10);
        const unitPrice = calculateProductPrice(product);
        const totalPrice = unitPrice * quantity;
        subtotal += totalPrice;

        return {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice,
          totalPrice,
        };
      });

      const shippingFee = subtotal >= 20000000 ? 0 : resolveShippingFee();
      const totalAmount = subtotal + shippingFee;

      const normalizedPaymentMethod =
        typeof paymentMethod === "string" &&
        paymentMethod.toUpperCase() === "BANK_TRANSFER"
          ? "BANK_TRANSFER"
          : "COD";

      const order = await Order.create(
        {
          userId: req.user.id,
          status: "PENDING",
          subtotal,
          shippingFee,
          totalAmount,
          shippingAddress: shippingAddress.trim(),
          contactPhone: contactPhone.trim(),
          paymentMethod: normalizedPaymentMethod,
          notes: notes?.trim() || null,
        },
        { transaction }
      );

      const orderItemsWithId = orderItemsPayload.map((item) => ({
        ...item,
        orderId: order.id,
      }));

      await OrderItem.bulkCreate(orderItemsWithId, { transaction });

      for (const item of normalizedItems) {
        const product = productMap.get(item.productId);
        product.stock -= item.quantity;
        product.soldCount += item.quantity;
        await product.save({ transaction });
      }

      await transaction.commit();

      const orderWithRelations = await Order.findByPk(order.id, {
        include: buildOrderInclude(),
      });

      return res.status(201).json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: orderWithRelations,
      });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tạo đơn hàng",
      errorCode: "CREATE_ORDER_ERROR",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);

    const { rows, count } = await Order.findAndCountAll({
      where: { userId: req.user.id },
      include: buildOrderInclude(),
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đơn hàng",
      errorCode: "GET_MY_ORDERS_ERROR",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { status, search } = req.query;

    const where = {};

    if (status && ORDER_STATUSES.includes(status)) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { orderNumber: { [Op.like]: `%${search}%` } },
        { "$customer.email$": { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Order.findAndCountAll({
      where,
      include: buildOrderInclude(),
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đơn hàng",
      errorCode: "GET_ALL_ORDERS_ERROR",
    });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: buildOrderInclude(),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Đơn hàng không tồn tại",
        errorCode: "ORDER_NOT_FOUND",
      });
    }

    const isOwner = order.userId === req.user?.id;
    const isPrivilegedUser =
      req.user && [ROLES.ADMIN, ROLES.SUPPORTER].includes(req.user.roleId);

    if (!isOwner && !isPrivilegedUser) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem đơn hàng này",
        errorCode: "ORDER_FORBIDDEN",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Get order detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy chi tiết đơn hàng",
      errorCode: "GET_ORDER_ERROR",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đơn hàng không hợp lệ",
        errorCode: "INVALID_ORDER_STATUS",
      });
    }

    const order = await Order.findByPk(orderId, {
      include: buildOrderInclude(),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Đơn hàng không tồn tại",
        errorCode: "ORDER_NOT_FOUND",
      });
    }

    const isFinalStatus = ["COMPLETED", "CANCELLED"].includes(order.status);
    if (isFinalStatus) {
      return res.status(400).json({
        success: false,
        message: "Không thể cập nhật đơn hàng đã hoàn tất hoặc hủy",
        errorCode: "ORDER_FINALIZED",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái đơn hàng",
      errorCode: "UPDATE_ORDER_STATUS_ERROR",
    });
  }
};

export default {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
};
