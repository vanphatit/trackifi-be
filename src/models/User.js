import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase().trim());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("firstName", value.trim());
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("lastName", value.trim());
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      set(value) {
        this.setDataValue("address", value ? value.trim() : null);
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      set(value) {
        this.setDataValue("phoneNumber", value ? value.trim() : null);
      },
    },
    gender: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // true for male, false for female
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roleId: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    positionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true, // tự động thêm createdAt và updatedAt
    tableName: "users",
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
    ],
    hooks: {
      // Hash password trước khi lưu
      beforeSave: async (user, options) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Instance method để kiểm tra password
User.prototype.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method để lấy full name
User.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Static method để tìm user theo email
User.findByEmail = function (email) {
  return this.findOne({ where: { email: email.toLowerCase() } });
};

export default User;
