# 🚀 Trackifi Backend - E-commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Elasticsearch](https://img.shields.io/badge/Elasticsearch-8.15-blue.svg)](https://www.elastic.co/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![Express](https://img.shields.io/badge/Express-4.21+-red.svg)](https://expressjs.com/)

**Trackifi** là nền tảng thương mại điện tử laptop với tính năng tìm kiếm thông minh được hỗ trợ bởi Elasticsearch và hệ thống quản lý sản phẩm toàn diện.

## 🏗 Architecture Overview

- **Backend**: Express.js + MySQL (Sequelize) + JWT Authentication
- **Search Engine**: Elasticsearch 8.15+ với Vietnamese text analysis
- **Frontend**: React/TypeScript components tích hợp
- **Development**: Babel transpilation với nodemon hot reload
- **Authentication**: JWT access tokens + HTTP-only refresh token cookies

## ✨ Key Features

### 🔍 Advanced Search Engine

- **Full-text Search**: Tìm kiếm thông minh với Vietnamese analyzer
- **Fuzzy Search**: Xử lý lỗi chính tả và tìm kiếm gần đúng
- **Multi-field Search**: Tìm kiếm đồng thời trên nhiều trường
- **Advanced Filtering**: Lọc theo danh mục, giá, thương hiệu, khuyến mãi, lượt xem
- **Autocomplete**: Gợi ý real-time khi người dùng gõ
- **Related Products**: Sản phẩm liên quan thông minh
- **Faceted Search**: Aggregations động cho UI filters

### 🛒 E-commerce Core

- **Product Management**: CRUD operations với real-time sync
- **Category System**: Phân loại sản phẩm hierarchy
- **Order Processing**: Quản lý đơn hàng từ cart đến payment
- **User Authentication**: JWT-based auth với refresh tokens
- **Admin Dashboard**: Quản trị viên với role-based access

### 🚀 Performance & Scalability

- **Real-time Sync**: Tự động đồng bộ MySQL ↔ Elasticsearch
- **Bulk Operations**: Efficient data processing
- **Caching Ready**: Redis integration ready
- **Error Handling**: Comprehensive error management với fallbacks

## 📁 Project Structure

```
trackifi-be/
├── src/
│   ├── config/                    # Database & Elasticsearch config
│   │   ├── database.js           # MySQL Sequelize setup
│   │   ├── elasticsearch.js      # ES client & index management
│   │   └── viewEngine.js         # EJS template engine
│   ├── controllers/               # Route handlers
│   │   ├── homeController.js     # Main CRUD operations
│   │   └── searchController.js   # Elasticsearch APIs
│   ├── services/                  # Business logic layer
│   │   ├── CRUDService.js        # Database operations
│   │   └── ElasticsearchService.js # Search operations
│   ├── models/                    # Sequelize models
│   │   ├── index.js              # Models associations
│   │   ├── User.js               # User model với auth
│   │   ├── Product.js            # Product model
│   │   └── Category.js           # Category model
│   ├── middleware/                # Custom middleware
│   │   └── elasticsearchSync.js  # Real-time sync middleware
│   ├── route/                     # API routes definition
│   │   └── web.js                # All routes mapping
│   ├── scripts/                   # Utility scripts
│   │   ├── setupElasticsearch.js # ES setup & indexing
│   │   └── seedUsers.js          # Database seeding
│   ├── views/                     # EJS templates
│   │   ├── crud.ejs              # Main admin interface
│   │   └── users/                # User management views
│   ├── components/                # React components
│   │   ├── Avatar.tsx            # User avatar component
│   │   └── ProfileCard.tsx       # Profile card component
│   ├── utils/                     # Utility functions
│   │   └── slugify.js            # Vietnamese text slugify
│   ├── App.tsx                    # React app entry point
│   └── server.js                  # Express server entry
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies & scripts
├── postman_collection.json       # Complete API collection
├── postman_environment.json      # Postman environment
└── ELASTICSEARCH_INTEGRATION.md  # Detailed ES guide
```

## 🛠 Quick Start

### Prerequisites

- **Node.js** 18+
- **Docker** + **Docker Compose** (for the bundled MySQL container)
- **MySQL** 8.0+ (only if you skip Docker)
- **Elasticsearch** 8.15+ (Docker recommended)

### 1. Clone & Install

```bash
git clone https://github.com/vanphatit/trackifi-be.git
cd trackifi-be
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Configure your environment variables
```

**Key Environment Variables:**

```env
PORT=6969
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=trackifi_dev
DB_USER=trackifi
DB_PASSWORD=trackifi

# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200
# ELASTICSEARCH_USERNAME=elastic    # if auth enabled
# ELASTICSEARCH_PASSWORD=changeme   # if auth enabled

# JWT Configuration
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Start Services

#### Start MySQL (Docker - Recommended)

```bash
docker compose up -d mysql
# optional: watch logs until healthy
docker compose logs -f mysql
```

MySQL runs on `127.0.0.1:3306` with credentials matching `.env` (`DB_USER=trackifi`, `DB_PASSWORD=trackifi`, `DB_NAME=trackifi_dev`). Data is persisted in the `mysql_data` volume.

#### Start Elasticsearch (Docker Compose)

```bash
docker compose up -d elasticsearch
# optional: watch logs until yellow/green
docker compose logs -f elasticsearch
```

Elasticsearch exposes `http://localhost:9200` with security disabled for local development and data persisted in the `es_data` volume.

### 4. Setup Database & Search Index

```bash
# Setup Elasticsearch index và reindex data
npm run es:setup -- --reindex

# Seed sample users (optional)
npm run seed
```

### 5. Start Development Server

```bash
npm start
# Server runs on http://localhost:6969
```

## 📡 API Documentation

### 🔍 Search APIs

#### Advanced Product Search

```http
POST /api/search/products
Content-Type: application/json

{
  "q": "gaming laptop",              // Từ khóa tìm kiếm
  "category": "gaming-laptops",      // Slug danh mục
  "brand": ["ASUS", "MSI"],         // Thương hiệu (array hoặc string)
  "minPrice": 20000000,             // Giá tối thiểu (VNĐ)
  "maxPrice": 60000000,             // Giá tối đa (VNĐ)
  "minDiscount": 5,                 // % giảm giá tối thiểu
  "inStock": true,                  // Chỉ hàng có sẵn
  "sortBy": "price_asc",            // Sắp xếp
  "page": 1,                        // Trang (default: 1)
  "limit": 12                       // Items/trang (max: 100)
}
```

**Sort Options:**

- `relevance`: Độ liên quan (default khi có từ khóa)
- `popularity`: Độ phổ biến (default khi không có từ khóa)
- `price_asc`: Giá tăng dần
- `price_desc`: Giá giảm dần
- `newest`: Mới nhất
- `rating`: Đánh giá cao nhất
- `name_asc`: Tên A-Z

#### Autocomplete Suggestions

```http
GET /api/search/autocomplete?q=asus&limit=10
```

#### Related Products

```http
GET /api/search/related/:productId?limit=6
```

#### Popular Search Terms

```http
GET /api/search/popular-terms?limit=10
```

#### Search Filters (for UI)

```http
GET /api/search/filters
```

### 🛒 Core E-commerce APIs

#### Authentication

```http
POST /api/auth/register         # User registration
POST /api/auth/login            # User login
POST /api/auth/refresh-token    # Refresh access token
POST /api/auth/logout           # Logout & invalidate tokens
POST /api/auth/forgot-password  # Request password reset
POST /api/auth/reset-password   # Reset password with token
```

#### User Profile

```http
GET  /api/user/profile          # Get user profile (protected)
PUT  /api/user/profile          # Update user profile (protected)
PATCH /api/user/profile/password# Change password (protected)
DELETE /api/user/profile        # Deactivate account (protected)
```

#### Products

```http
GET    /api/products            # List all products
GET    /api/products/:id        # Get product details
POST   /api/products            # Create product (admin)
PUT    /api/products/:id        # Update product (admin)
DELETE /api/products/:id        # Delete product (admin)
```

#### Categories

```http
GET    /api/categories          # List all categories
GET    /api/categories/:id      # Get category details
POST   /api/categories          # Create category (admin)
PUT    /api/categories/:id      # Update category (admin)
DELETE /api/categories/:id      # Delete category (admin)
```

## 🧪 Testing với Postman

Import collection và environment:

1. **Import Collection**: `postman_collection.json`
2. **Import Environment**: `postman_environment.json`
3. **Set Environment**: Chọn "Trackifi Development"

### Test Flow:

1. **Health Check** - Verify server status
2. **Register/Login** - Get access tokens
3. **Search Products** - Test advanced search
4. **CRUD Operations** - Test product management
5. **Autocomplete** - Test search suggestions

## 🚀 npm Scripts

```json
{
  "start": "nodemon --exec babel-node src/server.js",
  "seed": "babel-node src/scripts/seedUsers.js",
  "es:setup": "babel-node src/scripts/setupElasticsearch.js",
  "es:reindex": "npm run es:setup -- --reindex",
  "es:reset": "npm run es:setup -- --recreate --reindex"
}
```

**Script Usage:**

```bash
npm start                    # Start development server
npm run seed                 # Seed sample users
npm run es:setup            # Create ES index (first time)
npm run es:reindex          # Reindex all products
npm run es:reset            # Reset index và reindex
```

## 🔧 Development Workflow

### Adding New Features

#### 1. New API Endpoints:

1. Add route in `src/route/web.js`
2. Create controller method in appropriate controller
3. Add service method in respective service class
4. Create EJS view if needed (for admin interface)

#### 2. New Search Features:

1. Modify `ElasticsearchService.js` for search logic
2. Update `searchController.js` for API endpoints
3. Modify index mapping in `elasticsearch.js` if needed
4. Update sync middleware if required

#### 3. New Models:

1. Create model file in `src/models/`
2. Add associations in `src/models/index.js`
3. Update database sync in setup scripts
4. Add corresponding service methods

## 🏗 Architecture Patterns

### MVC Architecture

```
Route → Controller → Service → Model → Database
                  ↓
                View (EJS/React)
```

### Service Layer Pattern

- Controllers are thin - delegate to services
- Services contain business logic
- Services return transformed data, exclude sensitive fields
- Use Promise-based async/await pattern

### Real-time Data Sync

```
CRUD Operation → MySQL → Middleware → Elasticsearch
                      ↓
               Response to Client
```

## 🚨 Error Handling

### Common Errors & Solutions

| Error Code               | Description                | Solution                                |
| ------------------------ | -------------------------- | --------------------------------------- |
| `ECONNREFUSED`           | Elasticsearch offline      | Check ES service: `curl localhost:9200` |
| `SEARCH_INDEX_NOT_FOUND` | ES index missing           | Run: `npm run es:setup`                 |
| `CONNECTION_ERROR`       | Database connection failed | Check MySQL service & credentials       |
| `INVALID_PRICE_RANGE`    | minPrice > maxPrice        | Validate input at frontend              |

### Fallback Strategy

- **Elasticsearch offline**: Server continues with MySQL-only queries
- **Search features disabled**: API returns graceful error messages
- **Database errors**: Comprehensive error logging and user feedback

## 🔐 Security Features

- **JWT Authentication**: Access tokens (15min) + HTTP-only refresh tokens (7 days)
- **Rate Limiting**: Login attempts, forgot password, API calls
- **Bcrypt Password Hashing**: Salt rounds: 10
- **CORS Configuration**: Configured for frontend integration
- **Input Validation**: Request validation and sanitization
- **SQL Injection Protection**: Sequelize ORM parameterized queries

## 📊 Performance Optimizations

- **Database Indexing**: Optimized indexes on frequently queried fields
- **Elasticsearch Bulk Operations**: Efficient data indexing
- **Response Pagination**: Limit large dataset responses
- **Connection Pooling**: Database connection optimization
- **Middleware Caching**: Ready for Redis integration

## 🚀 Deployment

### Production Checklist

#### Environment Configuration

```env
NODE_ENV=production
PORT=8080
# Use production database credentials
# Use HTTPS URLs for external services
# Set strong JWT secrets
```

#### Elasticsearch Production Setup

1. **Setup ES Cluster**: Multi-node for high availability
2. **Enable Security**: xpack.security.enabled=true
3. **Setup Monitoring**: Kibana for insights
4. **Backup Strategy**: Regular index snapshots
5. **Performance Tuning**: Optimize for query patterns

#### Database Production Setup

1. **Connection Pooling**: Configure appropriate pool sizes
2. **Backup Strategy**: Regular automated backups
3. **Performance Monitoring**: Query performance tracking
4. **Security**: SSL connections, restricted access

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

### Health Checks

- **GET** `/health` - Server health status
- **GET** `/api/search/health` - Elasticsearch connectivity
- **GET** `/api/db/health` - Database connectivity

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Follow existing ESLint configuration
- Use meaningful variable names
- Comment complex business logic
- Write tests for new features

## 📚 Additional Resources

- [Elasticsearch Integration Guide](./ELASTICSEARCH_INTEGRATION.md)
- [Postman Collection](./postman_collection.json)
- [Environment Setup](./postman_environment.json)
