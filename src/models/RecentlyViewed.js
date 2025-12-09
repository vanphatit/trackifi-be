import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const RecentlyViewed = sequelize.define(
  "RecentlyViewed",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "recently_viewed",
    timestamps: true,
    indexes: [
      {
        name: "recently_viewed_user_product",
        unique: true,
        fields: ["userId", "productId"],
      },
      {
        name: "recently_viewed_user_id",
        fields: ["userId"],
      },
      {
        name: "recently_viewed_viewed_at",
        fields: ["viewedAt"],
      },
    ],
  }
);

export default RecentlyViewed;
