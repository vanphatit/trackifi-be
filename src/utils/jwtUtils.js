import jwt from "jsonwebtoken";
import crypto from "crypto";
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "trackifi-secret-key-2024";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "trackifi-refresh-secret-key-2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Tạo access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "trackifi-app",
    audience: "trackifi-users",
  });
};

// Tạo refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: "trackifi-app",
    audience: "trackifi-users",
  });
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "trackifi-app",
      audience: "trackifi-users",
    });
  } catch (error) {
    throw error;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: "trackifi-app",
      audience: "trackifi-users",
    });
  } catch (error) {
    throw error;
  }
};

// Tạo token pair (access + refresh)
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
  };
};

// Tạo random token cho email verification và password reset
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Decode token mà không verify (để lấy payload)
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Cookie options cho refresh token
const getRefreshTokenCookieOptions = () => {
  return {
    httpOnly: true, // Không thể truy cập từ JavaScript
    secure: process.env.NODE_ENV === "production", // Chỉ dùng HTTPS trong production
    sameSite: "strict", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (milliseconds)
    path: "/", // Available trên toàn bộ site
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  generateRandomToken,
  decodeToken,
  getRefreshTokenCookieOptions,
};
