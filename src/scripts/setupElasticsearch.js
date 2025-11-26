import connectDB from "../config/database.js";
import {
  testConnection,
  createProductIndex,
  deleteProductIndex,
} from "../config/elasticsearch.js";
import ElasticsearchService from "../services/ElasticsearchService.js";
import "../models/index.js"; // Import to initialize associations

const setupElasticsearch = async () => {
  try {
    console.log("🚀 Setting up Elasticsearch for Trackifi...");

    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.log("❌ Cannot proceed without Elasticsearch connection");
      process.exit(1);
    }

    // Ask user what to do
    const args = process.argv.slice(2);
    const forceRecreate = args.includes("--recreate") || args.includes("-r");

    if (forceRecreate) {
      console.log("🗑️  Recreating product index...");
      await deleteProductIndex();
    }

    // Create product index
    await createProductIndex();

    // Connect to database
    await connectDB();

    // Check if we should reindex products
    const shouldReindex =
      forceRecreate || args.includes("--reindex") || args.includes("-i");

    if (shouldReindex) {
      console.log("📊 Reindexing all products...");
      await ElasticsearchService.reindexAllProducts();
    }

    console.log("✅ Elasticsearch setup completed successfully!");
    console.log("");
    console.log("Available search endpoints:");
    console.log("- POST /api/search/products");
    console.log("- GET  /api/search/autocomplete");
    console.log("- GET  /api/search/related/:productId");
    console.log("- GET  /api/search/popular-terms");
    console.log("- GET  /api/search/filters");
    console.log("");
    console.log("To reindex products later, run: npm run es:reindex");
  } catch (error) {
    console.error("❌ Error setting up Elasticsearch:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Handle different command line arguments
const showHelp = () => {
  console.log(`
Trackifi Elasticsearch Setup

Usage:
  npm run es:setup                    # Setup indexes only
  npm run es:setup -- --recreate      # Delete and recreate indexes
  npm run es:setup -- --reindex       # Setup and reindex all products
  npm run es:setup -- --recreate --reindex  # Full reset and reindex

Options:
  --recreate, -r    Delete existing indexes and recreate
  --reindex, -i     Reindex all products from database
  --help, -h        Show this help message
`);
};

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  showHelp();
  process.exit(0);
}

setupElasticsearch();
