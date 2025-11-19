import { Op } from "sequelize";
import User from "../models/User.js";
import { ROLE_LIST } from "../constants/roles.js";

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const listUsers = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { search, role } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role && ROLE_LIST.includes(role)) {
      where.roleId = role;
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: {
        exclude: [
          "password",
          "refreshToken",
          "emailVerificationToken",
          "passwordResetToken",
        ],
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách người dùng thành công",
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("List users error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách người dùng",
      errorCode: "LIST_USERS_ERROR",
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!ROLE_LIST.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role không hợp lệ",
        errorCode: "INVALID_ROLE",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
        errorCode: "USER_NOT_FOUND",
      });
    }

    if (user.roleId === role) {
      return res.status(200).json({
        success: true,
        message: "Role không có sự thay đổi",
        data: {
          id: user.id,
          email: user.email,
          roleId: user.roleId,
        },
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Không thể thay đổi role của chính bạn",
        errorCode: "CANNOT_UPDATE_SELF_ROLE",
      });
    }

    user.roleId = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật role thành công",
      data: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật role",
      errorCode: "UPDATE_ROLE_ERROR",
    });
  }
};

export default {
  listUsers,
  updateUserRole,
};
