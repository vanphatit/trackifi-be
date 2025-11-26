import ElasticsearchService from "../services/ElasticsearchService.js";

// Middleware to sync product changes to Elasticsearch
export const syncProductToElasticsearch = (operation) => {
  return async (req, res, next) => {
    // Store original response methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to detect successful operations
    const handleResponse = async (body, isSuccessful) => {
      if (isSuccessful && body?.success && body?.data) {
        try {
          switch (operation) {
            case "create":
            case "update":
              if (body.data.id) {
                // Re-fetch product with associations for indexing
                const Product = require("../models/Product.js").default;
                const Category = require("../models/Category.js").default;

                const product = await Product.findByPk(body.data.id, {
                  include: [
                    {
                      model: Category,
                      as: "category",
                      attributes: ["id", "name", "slug"],
                    },
                  ],
                });

                if (product) {
                  await ElasticsearchService.indexProduct(product);
                  console.log(
                    `📊 Synced product ${product.id} to Elasticsearch (${operation})`
                  );
                }
              }
              break;

            case "delete":
              if (req.params?.productId) {
                await ElasticsearchService.deleteProduct(
                  parseInt(req.params.productId, 10)
                );
                console.log(
                  `📊 Removed product ${req.params.productId} from Elasticsearch`
                );
              }
              break;
          }
        } catch (error) {
          console.error(
            `❌ Error syncing product to Elasticsearch (${operation}):`,
            error
          );
          // Don't fail the main request, just log the error
        }
      }
    };

    // Override json method
    res.json = function (body) {
      handleResponse(body, this.statusCode >= 200 && this.statusCode < 300);
      return originalJson.call(this, body);
    };

    // Override send method
    res.send = function (body) {
      if (typeof body === "string") {
        try {
          const parsed = JSON.parse(body);
          handleResponse(
            parsed,
            this.statusCode >= 200 && this.statusCode < 300
          );
        } catch (e) {
          // Not JSON, ignore
        }
      }
      return originalSend.call(this, body);
    };

    next();
  };
};

// Middleware to sync multiple products (for bulk operations)
export const syncBulkProductsToElasticsearch = () => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = async function (body) {
      if (body?.success && this.statusCode >= 200 && this.statusCode < 300) {
        try {
          // This could be used for bulk operations in the future
          // For now, individual sync is sufficient
          console.log("📊 Bulk product sync triggered");
        } catch (error) {
          console.error("❌ Error in bulk Elasticsearch sync:", error);
        }
      }
      return originalJson.call(this, body);
    };

    next();
  };
};
