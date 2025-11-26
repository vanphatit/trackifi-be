import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { slugify } from "../utils/slugify.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      set(value) {
        this.setDataValue("name", value.trim());
      },
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: true,
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    brand: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specs: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ratingAverage: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    soldCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "products",
    timestamps: true,
    indexes: [
      { fields: ["slug"], unique: true },
      { fields: ["sku"], unique: true },
      { fields: ["brand"] },
      { fields: ["name"] },
    ],
    hooks: {
      beforeValidate: (product) => {
        if (product.name && !product.slug) {
          product.slug = slugify(product.name);
        }
        if (!product.sku) {
          product.sku = `LAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
      },
    },
  }
);

// Associations
Product.associate = function (models) {
  Product.belongsTo(models.Category, {
    foreignKey: "categoryId",
    as: "Category",
  });
};

export default Product;
