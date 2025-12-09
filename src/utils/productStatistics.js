import { sequelize } from "../config/database.js";
import Review from "../models/Review.js";

/**
 * Calculate total buyers for a product
 * Counts distinct users who have completed or shipped orders containing this product
 */
export const calculateTotalBuyers = async (productId) => {
  try {
    const result = await sequelize.query(
      `SELECT COUNT(DISTINCT o.userId) as count 
       FROM orders o 
       JOIN order_items oi ON o.id = oi.orderId 
       WHERE oi.productId = :productId 
       AND o.status IN ('COMPLETED', 'SHIPPED')`,
      {
        replacements: { productId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return parseInt(result[0]?.count || 0, 10);
  } catch (error) {
    console.error("Error calculating total buyers:", error);
    return 0;
  }
};

/**
 * Calculate total comments for a product
 * Returns the count of reviews for this product
 */
export const calculateTotalComments = async (productId) => {
  try {
    const count = await Review.count({
      where: { productId },
    });
    return count;
  } catch (error) {
    console.error("Error calculating total comments:", error);
    return 0;
  }
};

/**
 * Get product statistics (buyers and comments)
 */
export const getProductStatistics = async (productId) => {
  const [totalBuyers, totalComments] = await Promise.all([
    calculateTotalBuyers(productId),
    calculateTotalComments(productId),
  ]);

  return {
    totalBuyers,
    totalComments,
  };
};

/**
 * Attach statistics to product object
 */
export const attachProductStatistics = async (product) => {
  if (!product) return null;

  const stats = await getProductStatistics(product.id);

  // Convert to plain object if it's a Sequelize instance
  const productData = product.toJSON ? product.toJSON() : product;

  return {
    ...productData,
    totalBuyers: stats.totalBuyers,
    totalComments: stats.totalComments,
  };
};

/**
 * Attach statistics to multiple products
 */
export const attachProductsStatistics = async (products) => {
  if (!products || products.length === 0) return [];

  return Promise.all(
    products.map((product) => attachProductStatistics(product))
  );
};
