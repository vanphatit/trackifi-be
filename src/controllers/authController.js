import User from "../models/User.js";
import {
  generateTokenPair,
  verifyRefreshToken,
  generateRandomToken,
  getRefreshTokenCookieOptions,
} from "../utils/jwtUtils.js";
import validator from "validator";
import crypto from "crypto";

// Register API
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      gender,
      address,
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, firstName và lastName là bắt buộc",
        errorCode: "REQUIRED_FIELDS_MISSING",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ",
        errorCode: "INVALID_EMAIL",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password phải có ít nhất 6 ký tự",
        errorCode: "PASSWORD_TOO_SHORT",
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
        errorCode: "EMAIL_ALREADY_EXISTS",
      });
    }

    // Tạo user mới
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      gender: gender !== undefined ? Boolean(gender) : true,
      address: address || null,
      emailVerificationToken: generateRandomToken(),
    });

    // Tạo tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Lưu refresh token vào database
    await user.update({ refreshToken });

    // Set refresh token vào cookie
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    // Trả về response (không include sensitive data)
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      address: user.address,
      roleId: user.roleId,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký",
      errorCode: "REGISTER_ERROR",
    });
  }
};

// Login API
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và password là bắt buộc",
        errorCode: "REQUIRED_FIELDS_MISSING",
      });
    }

    // Tìm user theo email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
        errorCode: "INVALID_CREDENTIALS",
      });
    }

    // Kiểm tra password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
        errorCode: "INVALID_CREDENTIALS",
      });
    }

    // Tạo tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Lưu refresh token vào database
    await user.update({ refreshToken });

    // Set refresh token vào cookie
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    // Trả về response
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      address: user.address,
      roleId: user.roleId,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
      errorCode: "LOGIN_ERROR",
    });
  }
};

// Refresh Token API
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: clientRefreshToken } = req.cookies;

    if (!clientRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token bị thiếu",
        errorCode: "REFRESH_TOKEN_MISSING",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(clientRefreshToken);

    // Tìm user và kiểm tra refresh token trong database
    const user = await User.findByPk(decoded.userId);
    if (!user || user.refreshToken !== clientRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token không hợp lệ",
        errorCode: "INVALID_REFRESH_TOKEN",
      });
    }

    // Tạo tokens mới
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      generateTokenPair(tokenPayload);

    // Cập nhật refresh token mới
    await user.update({ refreshToken: newRefreshToken });

    // Set refresh token mới vào cookie
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: "Refresh token thành công",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token đã hết hạn",
        errorCode: "REFRESH_TOKEN_EXPIRED",
      });
    }

    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi refresh token",
      errorCode: "REFRESH_TOKEN_ERROR",
    });
  }
};

// Logout API
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Xóa refresh token khỏi database
    await User.update({ refreshToken: null }, { where: { id: userId } });

    // Xóa refresh token cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng xuất",
      errorCode: "LOGOUT_ERROR",
    });
  }
};

// Get Profile API
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "password",
          "refreshToken",
          "emailVerificationToken",
          "passwordResetToken",
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại",
        errorCode: "USER_NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin profile thành công",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin profile",
      errorCode: "GET_PROFILE_ERROR",
    });
  }
};

// Update Profile API
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phoneNumber, gender, address } = req.body;

    // Validation
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "firstName và lastName là bắt buộc",
        errorCode: "REQUIRED_FIELDS_MISSING",
      });
    }

    // Update user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại",
        errorCode: "USER_NOT_FOUND",
      });
    }

    await user.update({
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      gender: gender !== undefined ? Boolean(gender) : user.gender,
      address: address || null,
    });

    // Lấy thông tin user đã update (exclude sensitive fields)
    const updatedUser = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "password",
          "refreshToken",
          "emailVerificationToken",
          "passwordResetToken",
        ],
      },
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật profile thành công",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật profile",
      errorCode: "UPDATE_PROFILE_ERROR",
    });
  }
};

// Forgot Password API
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email là bắt buộc",
        errorCode: "EMAIL_REQUIRED",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ",
        errorCode: "INVALID_EMAIL",
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Để security, không thông báo email không tồn tại
      return res.status(200).json({
        success: true,
        message: "Nếu email tồn tại, link reset password đã được gửi",
      });
    }

    // Tạo reset token
    const resetToken = generateRandomToken();
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpires,
    });

    // TODO: Gửi email với reset token
    // Trong thực tế, bạn sẽ gửi email chứa link reset password
    console.log(`Reset token cho ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: "Link reset password đã được gửi đến email của bạn",
      // Trong development, có thể return token để test
      ...(process.env.NODE_ENV === "development" && { resetToken }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý forgot password",
      errorCode: "FORGOT_PASSWORD_ERROR",
    });
  }
};

// Reset Password API
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token và new password là bắt buộc",
        errorCode: "REQUIRED_FIELDS_MISSING",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password mới phải có ít nhất 6 ký tự",
        errorCode: "PASSWORD_TOO_SHORT",
      });
    }

    // Tìm user với reset token và token chưa hết hạn
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [require("sequelize").Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token reset password không hợp lệ hoặc đã hết hạn",
        errorCode: "INVALID_RESET_TOKEN",
      });
    }

    // Update password và xóa reset token
    await user.update({
      password: newPassword, // Sẽ được hash bởi beforeSave hook
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null, // Invalidate tất cả refresh tokens
    });

    res.status(200).json({
      success: true,
      message: "Reset password thành công",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi reset password",
      errorCode: "RESET_PASSWORD_ERROR",
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
