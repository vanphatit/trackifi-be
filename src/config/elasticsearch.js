import { Client } from "@elastic/elasticsearch";
require("dotenv").config();

// Elasticsearch client configuration
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  auth: process.env.ELASTICSEARCH_PASSWORD
    ? {
        username: process.env.ELASTICSEARCH_USERNAME || "elastic",
        password: process.env.ELASTICSEARCH_PASSWORD,
      }
    : undefined,
  requestTimeout: 30000,
  pingTimeout: 3000,
  sniffOnStart: false,
});

// Index names
export const INDICES = {
  PRODUCTS: "trackifi_products",
};

// Test Elasticsearch connection
export const testConnection = async () => {
  try {
    const health = await esClient.cluster.health();
    console.log("✅ Elasticsearch connected successfully");
    console.log(`   Status: ${health.status}`);
    console.log(`   Cluster: ${health.cluster_name}`);
    return true;
  } catch (error) {
    console.log("❌ Elasticsearch connection failed:", error.message);
    console.log(
      "   Make sure Elasticsearch is running on:",
      process.env.ELASTICSEARCH_URL || "http://localhost:9200"
    );
    return false;
  }
};

// Create product index with mapping
export const createProductIndex = async () => {
  try {
    const indexExists = await esClient.indices.exists({
      index: INDICES.PRODUCTS,
    });

    if (indexExists) {
      console.log(`Index ${INDICES.PRODUCTS} already exists`);
      return true;
    }

    await esClient.indices.create({
      index: INDICES.PRODUCTS,
      body: {
        settings: {
          analysis: {
            analyzer: {
              vietnamese_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase", "asciifolding"],
              },
            },
          },
        },
        mappings: {
          properties: {
            // Basic product info
            id: { type: "integer" },
            name: {
              type: "text",
              analyzer: "vietnamese_analyzer",
              fields: {
                keyword: { type: "keyword" },
                suggest: {
                  type: "completion",
                  analyzer: "vietnamese_analyzer",
                },
              },
            },
            slug: { type: "keyword" },
            sku: { type: "keyword" },
            brand: {
              type: "text",
              analyzer: "vietnamese_analyzer",
              fields: {
                keyword: { type: "keyword" },
              },
            },

            // Pricing and inventory
            price: { type: "double" },
            discountPercent: { type: "double" },
            finalPrice: { type: "double" }, // computed field
            stock: { type: "integer" },
            soldCount: { type: "integer" },

            // Content
            shortDescription: {
              type: "text",
              analyzer: "vietnamese_analyzer",
            },
            description: {
              type: "text",
              analyzer: "vietnamese_analyzer",
            },

            // Specifications
            specs: {
              type: "object",
              properties: {
                cpu: {
                  type: "text",
                  analyzer: "vietnamese_analyzer",
                  fields: { keyword: { type: "keyword" } },
                },
                gpu: {
                  type: "text",
                  analyzer: "vietnamese_analyzer",
                  fields: { keyword: { type: "keyword" } },
                },
                ram: {
                  type: "text",
                  analyzer: "vietnamese_analyzer",
                  fields: { keyword: { type: "keyword" } },
                },
                storage: {
                  type: "text",
                  analyzer: "vietnamese_analyzer",
                  fields: { keyword: { type: "keyword" } },
                },
                display: {
                  type: "text",
                  analyzer: "vietnamese_analyzer",
                  fields: { keyword: { type: "keyword" } },
                },
                weight: { type: "keyword" },
              },
            },

            // Category
            categoryId: { type: "integer" },
            category: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: {
                  type: "text",
                  analyzer: "vietnamese_analyzer",
                  fields: { keyword: { type: "keyword" } },
                },
                slug: { type: "keyword" },
              },
            },

            // Rating and reviews
            ratingAverage: { type: "double" },
            ratingCount: { type: "integer" },

            // Status
            isActive: { type: "boolean" },

            // Images
            images: { type: "keyword", index: false },

            // Dates
            createdAt: { type: "date" },
            updatedAt: { type: "date" },

            // Search boost fields
            searchText: {
              type: "text",
              analyzer: "vietnamese_analyzer",
            },
            popularityScore: { type: "double" }, // computed based on views, sales, etc.
          },
        },
      },
    });

    console.log(`✅ Created index: ${INDICES.PRODUCTS}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating index ${INDICES.PRODUCTS}:`, error);
    return false;
  }
};

// Delete product index
export const deleteProductIndex = async () => {
  try {
    const indexExists = await esClient.indices.exists({
      index: INDICES.PRODUCTS,
    });

    if (!indexExists) {
      console.log(`Index ${INDICES.PRODUCTS} does not exist`);
      return true;
    }

    await esClient.indices.delete({
      index: INDICES.PRODUCTS,
    });

    console.log(`✅ Deleted index: ${INDICES.PRODUCTS}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting index ${INDICES.PRODUCTS}:`, error);
    return false;
  }
};

export default esClient;
