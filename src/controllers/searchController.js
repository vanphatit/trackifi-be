import ElasticsearchService from "../services/ElasticsearchService.js";
import validator from "validator";

// Advanced product search
const searchProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      minDiscount,
      inStock,
      sortBy,
      page,
      limit,
    } = req.query;

    // Validate and sanitize inputs
    const searchParams = {
      q: q?.trim(),
      category: category?.trim(),
      brand: Array.isArray(brand)
        ? brand
        : brand?.split(",").map((b) => b.trim()),
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minDiscount: minDiscount ? parseFloat(minDiscount) : undefined,
      inStock: inStock === "true" || inStock === true,
      sortBy: sortBy || "relevance",
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100),
    };

    // Validate price range
    if (
      searchParams.minPrice &&
      searchParams.maxPrice &&
      searchParams.minPrice > searchParams.maxPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Giá tối thiểu không thể lớn hơn giá tối đa",
        errorCode: "INVALID_PRICE_RANGE",
      });
    }

    // Validate discount
    if (
      searchParams.minDiscount &&
      (searchParams.minDiscount < 0 || searchParams.minDiscount > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Phần trăm giảm giá phải từ 0 đến 100",
        errorCode: "INVALID_DISCOUNT_RANGE",
      });
    }

    const result = await ElasticsearchService.searchProducts(searchParams);

    return res.status(200).json({
      success: true,
      message: "Tìm kiếm sản phẩm thành công",
      data: {
        products: result.products,
        aggregations: result.aggregations,
        meta: result.meta,
        total: result.total,
      },
      searchParams,
    });
  } catch (error) {
    console.error("Search products error:", error);

    if (error.meta?.body?.error?.type === "index_not_found_exception") {
      return res.status(503).json({
        success: false,
        message:
          "Hệ thống tìm kiếm chưa được khởi tạo. Vui lòng liên hệ admin.",
        errorCode: "SEARCH_INDEX_NOT_FOUND",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm sản phẩm",
      errorCode: "SEARCH_ERROR",
    });
  }
};

// Get autocomplete suggestions
const getAutocompleteSuggestions = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Từ khóa tìm kiếm phải có ít nhất 2 ký tự",
        errorCode: "QUERY_TOO_SHORT",
      });
    }

    const suggestions = await ElasticsearchService.getAutocompleteSuggestions(
      q.trim(),
      Math.min(parseInt(limit, 10) || 10, 20)
    );

    return res.status(200).json({
      success: true,
      message: "Lấy gợi ý tìm kiếm thành công",
      data: suggestions,
    });
  } catch (error) {
    console.error("Get autocomplete suggestions error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy gợi ý tìm kiếm",
      errorCode: "AUTOCOMPLETE_ERROR",
    });
  }
};

// Get related products
const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit } = req.query;

    if (!validator.isInt(String(productId))) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
        errorCode: "INVALID_PRODUCT_ID",
      });
    }

    const relatedProducts = await ElasticsearchService.getRelatedProducts(
      parseInt(productId, 10),
      Math.min(parseInt(limit, 10) || 6, 20)
    );

    return res.status(200).json({
      success: true,
      message: "Lấy sản phẩm liên quan thành công",
      data: relatedProducts,
    });
  } catch (error) {
    console.error("Get related products error:", error);

    if (error.meta?.body?.found === false) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
        errorCode: "PRODUCT_NOT_FOUND",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy sản phẩm liên quan",
      errorCode: "RELATED_PRODUCTS_ERROR",
    });
  }
};

// Get popular search terms and trends
const getPopularSearchTerms = async (req, res) => {
  try {
    const { limit } = req.query;

    const popularTerms = await ElasticsearchService.getPopularSearchTerms(
      Math.min(parseInt(limit, 10) || 10, 20)
    );

    return res.status(200).json({
      success: true,
      message: "Lấy từ khóa phổ biến thành công",
      data: popularTerms,
    });
  } catch (error) {
    console.error("Get popular search terms error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy từ khóa phổ biến",
      errorCode: "POPULAR_TERMS_ERROR",
    });
  }
};

// Get search filters/facets for UI
const getSearchFilters = async (req, res) => {
  try {
    // This endpoint provides filter options for the frontend
    const result = await ElasticsearchService.searchProducts({
      page: 1,
      limit: 0, // Don't need actual products, just aggregations
    });

    const filters = {
      categories: result.aggregations.categories.map((cat) => ({
        key: cat.key,
        name: cat.key,
        count: cat.doc_count,
      })),
      brands: result.aggregations.brands.map((brand) => ({
        key: brand.key,
        name: brand.key,
        count: brand.doc_count,
      })),
      priceRanges: result.aggregations.priceRanges.map((range) => ({
        key: range.key,
        from: range.from,
        to: range.to,
        count: range.doc_count,
        label: this.getPriceRangeLabel(range),
      })),
      avgPrice: result.aggregations.avgPrice,
    };

    return res.status(200).json({
      success: true,
      message: "Lấy bộ lọc tìm kiếm thành công",
      data: filters,
    });
  } catch (error) {
    console.error("Get search filters error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bộ lọc tìm kiếm",
      errorCode: "SEARCH_FILTERS_ERROR",
    });
  }
};

// Helper method to format price range labels
const getPriceRangeLabel = (range) => {
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)}M`;
    }
    return `${(price / 1000).toFixed(0)}K`;
  };

  if (range.key === "under-20m") {
    return "Dưới 20M";
  } else if (range.key === "20m-40m") {
    return "20M - 40M";
  } else if (range.key === "40m-60m") {
    return "40M - 60M";
  } else if (range.key === "over-60m") {
    return "Trên 60M";
  }

  if (range.from && range.to) {
    return `${formatPrice(range.from)} - ${formatPrice(range.to)}`;
  } else if (range.from) {
    return `Từ ${formatPrice(range.from)}`;
  } else if (range.to) {
    return `Dưới ${formatPrice(range.to)}`;
  }

  return range.key;
};

export default {
  searchProducts,
  getAutocompleteSuggestions,
  getRelatedProducts,
  getPopularSearchTerms,
  getSearchFilters,
};
