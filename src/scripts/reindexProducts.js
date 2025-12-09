import connectDB from "../config/database.js";
import { testConnection } from "../config/elasticsearch.js";
import ElasticsearchService from "../services/ElasticsearchService.js";
import "../models/index.js"; // Import to initialize associations

const reindexProducts = async () => {
  try {
    console.log("🔄 Reindexing Trackifi products...");

    // Test Elasticsearch connection
    const connected = await testConnection();
    if (!connected) {
      console.log("❌ Cannot proceed without Elasticsearch connection");
      process.exit(1);
    }

    // Connect to database
    await connectDB();

    // Start reindexing
    const startTime = Date.now();
    await ElasticsearchService.reindexAllProducts();
    const endTime = Date.now();

    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ Reindexing completed in ${duration} seconds`);
  } catch (error) {
    console.error("❌ Error during reindexing:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

reindexProducts();
