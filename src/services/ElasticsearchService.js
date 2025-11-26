import esClient, { INDICES } from "../config/elasticsearch.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

class ElasticsearchService {
  // Transform product data for Elasticsearch
  static transformProductForIndex(product) {
    const finalPrice =
      product.price * (1 - (product.discountPercent || 0) / 100);

    // Calculate popularity score based on multiple factors
    const popularityScore =
      (product.soldCount || 0) * 0.4 +
      (product.ratingAverage || 0) * (product.ratingCount || 0) * 0.3 +
      Math.log(Math.max(1, product.ratingCount || 0)) * 0.3;

    // Create searchable text combining all relevant fields
    const searchText = [
      product.name,
      product.brand,
      product.shortDescription,
      product.description,
      product.specs?.cpu,
      product.specs?.gpu,
      product.specs?.ram,
      product.specs?.storage,
      product.category?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand,
      price: parseFloat(product.price),
      discountPercent: parseFloat(product.discountPercent || 0),
      finalPrice: parseFloat(finalPrice.toFixed(2)),
      stock: product.stock,
      soldCount: product.soldCount || 0,
      shortDescription: product.shortDescription,
      description: product.description,
      specs: product.specs || {},
      categoryId: product.categoryId,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      ratingAverage: parseFloat(product.ratingAverage || 0),
      ratingCount: product.ratingCount || 0,
      isActive: product.isActive,
      images: product.images || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      searchText,
      popularityScore: parseFloat(popularityScore.toFixed(2)),
    };
  }

  // Index a single product
  static async indexProduct(product) {
    try {
      const doc = this.transformProductForIndex(product);

      const response = await esClient.index({
        index: INDICES.PRODUCTS,
        id: product.id,
        body: doc,
      });

      console.log(`✅ Indexed product ${product.id}: ${product.name}`);
      return response;
    } catch (error) {
      console.error(`❌ Error indexing product ${product.id}:`, error);
      throw error;
    }
  }

  // Index multiple products in bulk
  static async bulkIndexProducts(products) {
    try {
      if (!products.length) {
        console.log("No products to index");
        return;
      }

      const operations = [];

      products.forEach((product) => {
        const doc = this.transformProductForIndex(product);

        operations.push({
          index: { _index: INDICES.PRODUCTS, _id: product.id },
        });
        operations.push(doc);
      });

      const response = await esClient.bulk({
        body: operations,
      });

      const errors = response.items.filter((item) => item.index?.error);

      if (errors.length > 0) {
        console.error("❌ Bulk indexing errors:", errors);
        throw new Error(`Bulk indexing failed with ${errors.length} errors`);
      }

      console.log(`✅ Bulk indexed ${products.length} products`);
      return response;
    } catch (error) {
      console.error("❌ Error bulk indexing products:", error);
      throw error;
    }
  }

  // Delete a product from index
  static async deleteProduct(productId) {
    try {
      await esClient.delete({
        index: INDICES.PRODUCTS,
        id: productId,
      });

      console.log(`✅ Deleted product ${productId} from index`);
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        console.log(
          `Product ${productId} not found in index (already deleted)`
        );
      } else {
        console.error(`❌ Error deleting product ${productId}:`, error);
        throw error;
      }
    }
  }

  // Reindex all products from database
  static async reindexAllProducts() {
    try {
      console.log("🔄 Starting complete reindex of products...");

      const products = await Product.findAll({
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug"],
          },
        ],
      });

      if (products.length === 0) {
        console.log("No products found in database");
        return;
      }

      // Process in batches to avoid memory issues
      const batchSize = 100;
      let indexed = 0;

      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await this.bulkIndexProducts(batch);
        indexed += batch.length;

        console.log(`Progress: ${indexed}/${products.length} products indexed`);
      }

      console.log(`✅ Completed reindexing ${products.length} products`);
    } catch (error) {
      console.error("❌ Error during reindexing:", error);
      throw error;
    }
  }

  // Advanced search with filters
  static async searchProducts(searchParams) {
    try {
      const {
        q, // search query
        category,
        brand,
        minPrice,
        maxPrice,
        minDiscount,
        inStock,
        sortBy = "relevance",
        page = 1,
        limit = 12,
        isActive = true,
      } = searchParams;

      const offset = (page - 1) * limit;

      // Build query
      const query = {
        bool: {
          must: [],
          filter: [],
          should: [],
        },
      };

      // Text search
      if (q && q.trim()) {
        query.bool.must.push({
          multi_match: {
            query: q.trim(),
            fields: [
              "name^3",
              "brand^2",
              "shortDescription^1.5",
              "description",
              "specs.cpu^2",
              "specs.gpu^2",
              "specs.ram",
              "specs.storage",
              "category.name",
              "searchText",
            ],
            type: "best_fields",
            fuzziness: "AUTO",
            operator: "and",
          },
        });

        // Boost exact matches
        query.bool.should.push({
          match_phrase: {
            name: {
              query: q.trim(),
              boost: 5,
            },
          },
        });

        // Boost brand matches
        query.bool.should.push({
          match_phrase: {
            brand: {
              query: q.trim(),
              boost: 3,
            },
          },
        });
      } else {
        // If no search query, match all
        query.bool.must.push({ match_all: {} });
      }

      // Active products filter
      if (isActive !== undefined) {
        query.bool.filter.push({ term: { isActive } });
      }

      // Category filter
      if (category) {
        query.bool.filter.push({
          bool: {
            should: [
              { term: { "category.slug": category } },
              { term: { categoryId: parseInt(category) } },
            ],
          },
        });
      }

      // Brand filter
      if (brand) {
        if (Array.isArray(brand)) {
          query.bool.filter.push({
            terms: { "brand.keyword": brand },
          });
        } else {
          query.bool.filter.push({
            term: { "brand.keyword": brand },
          });
        }
      }

      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceFilter = { range: { finalPrice: {} } };

        if (minPrice !== undefined) {
          priceFilter.range.finalPrice.gte = parseFloat(minPrice);
        }

        if (maxPrice !== undefined) {
          priceFilter.range.finalPrice.lte = parseFloat(maxPrice);
        }

        query.bool.filter.push(priceFilter);
      }

      // Discount filter
      if (minDiscount !== undefined) {
        query.bool.filter.push({
          range: { discountPercent: { gte: parseFloat(minDiscount) } },
        });
      }

      // Stock filter
      if (inStock === true || inStock === "true") {
        query.bool.filter.push({
          range: { stock: { gt: 0 } },
        });
      }

      // Build sort
      const sort = this.buildSortClause(sortBy, q);

      // Execute search
      const searchResponse = await esClient.search({
        index: INDICES.PRODUCTS,
        body: {
          query,
          sort,
          from: offset,
          size: limit,
          highlight: {
            fields: {
              name: {},
              shortDescription: {},
              "specs.cpu": {},
              "specs.gpu": {},
            },
            pre_tags: ["<mark>"],
            post_tags: ["</mark>"],
          },
          aggs: {
            categories: {
              terms: {
                field: "category.slug",
                size: 20,
              },
            },
            brands: {
              terms: {
                field: "brand.keyword",
                size: 20,
              },
            },
            priceRanges: {
              range: {
                field: "finalPrice",
                ranges: [
                  { to: 20000000, key: "under-20m" },
                  { from: 20000000, to: 40000000, key: "20m-40m" },
                  { from: 40000000, to: 60000000, key: "40m-60m" },
                  { from: 60000000, key: "over-60m" },
                ],
              },
            },
            avgPrice: {
              avg: { field: "finalPrice" },
            },
          },
        },
      });

      // Process results
      const products = searchResponse.hits.hits.map((hit) => ({
        ...hit._source,
        _score: hit._score,
        _highlights: hit.highlight,
      }));

      return {
        products,
        total: searchResponse.hits.total.value,
        aggregations: {
          categories: searchResponse.aggregations.categories.buckets,
          brands: searchResponse.aggregations.brands.buckets,
          priceRanges: searchResponse.aggregations.priceRanges.buckets,
          avgPrice: searchResponse.aggregations.avgPrice.value,
        },
        meta: {
          page,
          limit,
          totalPages: Math.ceil(searchResponse.hits.total.value / limit),
          hasNextPage: offset + limit < searchResponse.hits.total.value,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("❌ Elasticsearch search error:", error);
      throw error;
    }
  }

  // Build sort clause based on sortBy parameter
  static buildSortClause(sortBy, hasQuery) {
    const sortOptions = {
      relevance: hasQuery
        ? [{ _score: { order: "desc" } }]
        : [{ popularityScore: { order: "desc" } }],
      price_asc: [{ finalPrice: { order: "asc" } }],
      price_desc: [{ finalPrice: { order: "desc" } }],
      newest: [{ createdAt: { order: "desc" } }],
      oldest: [{ createdAt: { order: "asc" } }],
      rating: [
        { ratingAverage: { order: "desc" } },
        { ratingCount: { order: "desc" } },
      ],
      popular: [
        { soldCount: { order: "desc" } },
        { popularityScore: { order: "desc" } },
      ],
      name_asc: [{ "name.keyword": { order: "asc" } }],
      name_desc: [{ "name.keyword": { order: "desc" } }],
      stock: [{ stock: { order: "desc" } }],
    };

    const sort = sortOptions[sortBy] || sortOptions.relevance;

    // Add secondary sort by relevance/popularity if not already sorting by it
    if (sortBy !== "relevance" && sortBy !== "popular") {
      if (hasQuery) {
        sort.push({ _score: { order: "desc" } });
      } else {
        sort.push({ popularityScore: { order: "desc" } });
      }
    }

    return sort;
  }

  // Get autocomplete suggestions
  static async getAutocompleteSuggestions(query, limit = 10) {
    try {
      const response = await esClient.search({
        index: INDICES.PRODUCTS,
        body: {
          suggest: {
            product_suggest: {
              prefix: query,
              completion: {
                field: "name.suggest",
                size: limit,
                skip_duplicates: true,
              },
            },
          },
          _source: false,
        },
      });

      const suggestions = response.suggest.product_suggest[0].options.map(
        (option) => ({
          text: option.text,
          score: option._score,
        })
      );

      return suggestions;
    } catch (error) {
      console.error("❌ Error getting autocomplete suggestions:", error);
      throw error;
    }
  }

  // Get related products based on similarity
  static async getRelatedProducts(productId, limit = 6) {
    try {
      // First get the current product
      const currentProduct = await esClient.get({
        index: INDICES.PRODUCTS,
        id: productId,
      });

      if (!currentProduct.found) {
        return [];
      }

      const source = currentProduct._source;

      // Search for similar products
      const response = await esClient.search({
        index: INDICES.PRODUCTS,
        body: {
          query: {
            bool: {
              must: [
                { term: { isActive: true } },
                {
                  more_like_this: {
                    fields: [
                      "name",
                      "brand",
                      "specs.cpu",
                      "specs.gpu",
                      "category.name",
                    ],
                    like: [{ _index: INDICES.PRODUCTS, _id: productId }],
                    min_term_freq: 1,
                    min_doc_freq: 1,
                    max_query_terms: 12,
                  },
                },
              ],
              must_not: [
                { term: { id: productId } }, // Exclude current product
              ],
              should: [
                { term: { categoryId: source.categoryId } }, // Same category boost
                { term: { "brand.keyword": source.brand } }, // Same brand boost
              ],
            },
          },
          size: limit,
        },
      });

      return response.hits.hits.map((hit) => hit._source);
    } catch (error) {
      console.error("❌ Error getting related products:", error);
      throw error;
    }
  }

  // Get popular search terms/trends
  static async getPopularSearchTerms(limit = 10) {
    try {
      // This would typically come from search logs
      // For now, return top brands and categories
      const response = await esClient.search({
        index: INDICES.PRODUCTS,
        body: {
          size: 0,
          aggs: {
            popular_brands: {
              terms: {
                field: "brand.keyword",
                size: limit,
                order: { total_sales: "desc" },
              },
              aggs: {
                total_sales: {
                  sum: { field: "soldCount" },
                },
              },
            },
            popular_categories: {
              terms: {
                field: "category.name.keyword",
                size: limit,
                order: { total_sales: "desc" },
              },
              aggs: {
                total_sales: {
                  sum: { field: "soldCount" },
                },
              },
            },
          },
        },
      });

      return {
        brands: response.aggregations.popular_brands.buckets,
        categories: response.aggregations.popular_categories.buckets,
      };
    } catch (error) {
      console.error("❌ Error getting popular search terms:", error);
      throw error;
    }
  }
}

export default ElasticsearchService;
