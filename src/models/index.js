// Models index file
import User from "./User.js";
import Category from "./Category.js";
import Product from "./Product.js";
import Order, { ORDER_STATUSES } from "./Order.js";
import OrderItem from "./OrderItem.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Review from "./Review.js";
import Wishlist from "./Wishlist.js";
import RecentlyViewed from "./RecentlyViewed.js";

// Product <-> Category
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// User <-> Order
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "customer" });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// User <-> Cart
User.hasOne(Cart, { foreignKey: "userId", as: "cart" });
Cart.belongsTo(User, { foreignKey: "userId", as: "user" });

// Cart <-> CartItem
Cart.hasMany(CartItem, { foreignKey: "cartId", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cartId", as: "cart" });

// Product <-> CartItem
Product.hasMany(CartItem, { foreignKey: "productId", as: "cartInclusions" });
CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// User <-> Review
User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

// Product <-> Review
Product.hasMany(Review, { foreignKey: "productId", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

// User <-> Wishlist
User.hasMany(Wishlist, { foreignKey: "userId", as: "wishlistItems" });
Wishlist.belongsTo(User, { foreignKey: "userId", as: "user" });

// Product <-> Wishlist
Product.hasMany(Wishlist, { foreignKey: "productId", as: "wishlistEntries" });
Wishlist.belongsTo(Product, { foreignKey: "productId", as: "product" });

// User <-> RecentlyViewed
User.hasMany(RecentlyViewed, {
  foreignKey: "userId",
  as: "recentlyViewedItems",
});
RecentlyViewed.belongsTo(User, { foreignKey: "userId", as: "user" });

// Product <-> RecentlyViewed
Product.hasMany(RecentlyViewed, { foreignKey: "productId", as: "viewHistory" });
RecentlyViewed.belongsTo(Product, { foreignKey: "productId", as: "product" });

const db = {
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Review,
  Wishlist,
  RecentlyViewed,
  ORDER_STATUSES,
};

export default db;
