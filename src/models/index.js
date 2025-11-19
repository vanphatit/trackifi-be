// MongoDB models index file
import User from "./User.js";
import Category from "./Category.js";
import Product from "./Product.js";
import Order, { ORDER_STATUSES } from "./Order.js";
import OrderItem from "./OrderItem.js";

Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "customer" });

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

const db = {
  User,
  Category,
  Product,
  Order,
  OrderItem,
  ORDER_STATUSES,
};

export default db;
