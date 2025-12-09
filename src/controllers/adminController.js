import { Op, fn, col } from "sequelize";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { ROLES } from "../constants/roles.js";

const getDashboardStats = async (req, res) => {
  try {
    // 1. Revenue (Total Amount of PAID or COMPLETED orders)
    const revenueResult = await Order.findOne({
      attributes: [[fn("SUM", col("totalAmount")), "totalRevenue"]],
      where: {
        status: { [Op.in]: ["PAID", "COMPLETED", "SHIPPED"] }, // Assuming SHIPPED counts towards committed revenue
      },
      raw: true,
    });

    // 2. Orders Count
    const ordersCount = await Order.count();
    const pendingOrders = await Order.count({ where: { status: "PENDING" } });

    // 3. Users Count
    const usersCount = await User.count({ where: { roleId: ROLES.CUSTOMER } });

    // 4. Low Stock Products
    const lowStockCount = await Product.count({
      where: {
        stock: { [Op.lte]: 5 },
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Lấy thống kê dashboard thành công",
      data: {
        revenue: parseFloat(revenueResult?.totalRevenue || 0),
        orders: {
          total: ordersCount,
          pending: pendingOrders,
        },
        users: {
          total: usersCount,
        },
        products: {
          lowStock: lowStockCount,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê dashboard",
      errorCode: "GET_STATS_ERROR",
    });
  }
};

export default {
  getDashboardStats,
};
