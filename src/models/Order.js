import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNumber: {
      type: DataTypes.STRING(40),
      unique: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...ORDER_STATUSES),
      allowNull: false,
      defaultValue: "PENDING",
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shippingFee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("COD", "BANK_TRANSFER"),
      defaultValue: "COD",
    },
    notes: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    hooks: {
      beforeValidate: (order) => {
        if (!order.orderNumber) {
          order.orderNumber = `ORD-${Date.now()}-${Math.floor(
            Math.random() * 1000
          )}`;
        }
      },
    },
  }
);

export { ORDER_STATUSES };
export default Order;

