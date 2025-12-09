# Trackifi Backend API Docs (Frontend Developer Reference)

Base URL: `http://localhost:8081` (Check `.env` or `server.js` for actual port, default might be `6969`)

**Common Request/Response Headers & Formats**

*   **Content-Type:** `application/json` (for POST/PUT/PATCH bodies).
*   **Authorization:** `Bearer <accessToken>` (Required for protected routes).
*   **Cookie:** `refreshToken` (Managed automatically by browser for `HttpOnly` cookies; used for token refresh).
*   **Response Format:**
    *   **Success:** `{ "success": true, "message": "...", "data": { ... } }`
    *   **Error:** `{ "success": false, "message": "...", "errorCode": "..." }`

---

## 1. Authentication

### Register
**POST** `/api/auth/register`

*   **Description:** Register a new user account.
*   **Body (Required):**
    *   `email` (string): Valid email address.
    *   `password` (string): Min 6 characters.
    *   `firstName` (string)
    *   `lastName` (string)
*   **Body (Optional):**
    *   `phoneNumber` (string)
    *   `gender` (boolean): `true` for male, `false` for female (default: `true`).
    *   `address` (string)
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Đăng ký thành công",
      "data": {
        "user": {
          "id": 1,
          "email": "user@example.com",
          "firstName": "Alice",
          "lastName": "Nguyen",
          "roleId": "CUSTOMER",
          "isEmailVerified": false,
          "createdAt": "..."
        },
        "accessToken": "eyJhbGci..."
      }
    }
    ```
*   **Errors:** `REQUIRED_FIELDS_MISSING`, `INVALID_EMAIL`, `PASSWORD_TOO_SHORT`, `EMAIL_ALREADY_EXISTS`.

### Login
**POST** `/api/auth/login`

*   **Description:** Authenticate user and receive access token. Sets `refreshToken` cookie.
*   **Body:**
    *   `email` (string, required)
    *   `password` (string, required)
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Đăng nhập thành công",
      "data": {
        "user": { "id": 1, "email": "...", "roleId": "CUSTOMER", ... },
        "accessToken": "eyJhbGci..."
      }
    }
    ```
*   **Errors:** `REQUIRED_FIELDS_MISSING`, `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`.

### Refresh Token
**POST** `/api/auth/refresh-token`

*   **Description:** Get a new access token using the HTTP-only `refreshToken` cookie.
*   **Headers:** Cookie must contain `refreshToken`.
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Refresh token thành công",
      "data": {
        "accessToken": "new_access_token..."
      }
    }
    ```
*   **Errors:** `REFRESH_TOKEN_MISSING`, `INVALID_REFRESH_TOKEN`, `REFRESH_TOKEN_EXPIRED`.

### Logout
**POST** `/api/auth/logout`

*   **Description:** Invalidate refresh token and clear cookie.
*   **Auth:** Required.
*   **Response (200 OK):**
    ```json
    { "success": true, "message": "Đăng xuất thành công" }
    ```

### Forgot Password
**POST** `/api/auth/forgot-password`
*   **Body:** `{ "email": "user@example.com" }`
*   **Response (200 OK):** `{ "success": true, "message": "Link reset password..." }` (Dev mode returns `resetToken`).

### Reset Password
**POST** `/api/auth/reset-password`
*   **Body:**
    *   `token` (string, required): The token received via email.
    *   `newPassword` (string, required): Min 6 chars.
*   **Response (200 OK):** `{ "success": true, "message": "Reset password thành công" }`

---

## 2. User Profile

**Auth Required:** Yes (Bearer Token).

### Get Profile
**GET** `/api/user/profile`

*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": 1,
          "email": "...",
          "firstName": "...",
          "lastName": "...",
          "phoneNumber": "...",
          "address": "...",
          "gender": true,
          "roleId": "CUSTOMER",
          "isActive": true
        }
      }
    }
    ```

### Update Profile
**PUT** `/api/user/profile`

*   **Body:**
    *   `firstName` (string, required)
    *   `lastName` (string, required)
    *   `phoneNumber` (string, optional)
    *   `gender` (boolean, optional)
    *   `address` (string, optional)
*   **Response (200 OK):** Returns updated user object in `data.user`.

### Change Password
**PATCH** `/api/user/profile/password`

*   **Body:**
    *   `currentPassword` (string, required)
    *   `newPassword` (string, required): Min 6 chars, different from old.
*   **Response (200 OK):** Success message. (User must relogin as refresh token is cleared).

### Deactivate Account
**DELETE** `/api/user/profile`

*   **Description:** Soft deletes the account (sets `isActive` to `false`).
*   **Response (200 OK):** Success message.

---

## 3. Products

### List Products (Public)
**GET** `/api/products`

*   **Query Parameters:**
    *   `page` (int): Default 1.
    *   `limit` (int): Default 12.
    *   `search` (string): Filter by name or brand (partial match).
    *   `brand` (string): Filter by brand (exact match).
    *   `category` (string or int): Slug or ID of category.
    *   `minPrice` (number)
    *   `maxPrice` (number)
    *   `sortBy` (string): `price`, `name`, `sold`, `createdAt` (default).
    *   `sortDir` (string): `ASC` or `DESC` (default).
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "Laptop Gaming...",
          "slug": "laptop-gaming...",
          "price": "20000000.00",
          "discountPercent": "10.00",
          "stock": 50,
          "images": ["url1", "url2"],
          "category": { "id": 2, "name": "Gaming", "slug": "gaming" },
          ...
        }
      ],
      "meta": {
        "totalItems": 100,
        "totalPages": 9,
        "page": 1,
        "limit": 12
      }
    }
    ```

### Get Best Sellers
**GET** `/api/products/best-sellers`

*   **Query Parameters:**
    *   `limit` (int): Number of items to return (default 10, max 20).
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Lấy danh sách sản phẩm bán chạy thành công",
      "data": [
        {
          "id": 1,
          "name": "Laptop Best Seller",
          "soldCount": 150,
          "price": "...",
          "category": { ... }
        }
      ]
    }
    ```

### Get Product Detail
**GET** `/api/products/:productId` (ID or Slug)

*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "name": "...",
        "specs": { "cpu": "i7", "ram": "16GB" },
        "description": "HTML content...",
        "images": [...],
        "category": { ... },
        ...
      }
    }
    ```

### Create Product (Admin/Supporter)
**POST** `/api/products`

*   **Body:**
    *   `name` (string, required)
    *   `brand` (string, required)
    *   `price` (number, required)
    *   `categoryId` (int, required)
    *   `stock` (int, required)
    *   `images` (array of strings, optional)
    *   `description` (string, optional)
    *   `shortDescription` (string, optional)
    *   `specs` (object, optional)
    *   `discountPercent` (number, optional)
    *   `isActive` (boolean, default true)

### Update Product (Admin/Supporter)
**PUT** `/api/products/:productId`

*   **Body:** Same fields as Create. Send only fields to update.

### Delete Product (Admin)
**DELETE** `/api/products/:productId`

*   **Description:** Soft delete if in orders, else hard delete.

---

## 4. Reviews

### List Reviews
**GET** `/api/products/:productId/reviews`
*   **Query:** `page`, `limit`.
*   **Response:** List of reviews with user info.

### Create Review
**POST** `/api/products/:productId/reviews`
*   **Auth:** Required.
*   **Body:** `{ "rating": 5, "comment": "Great!" }` (rating 1-5).
*   **Response:** Created review.

### Delete Review
**DELETE** `/api/reviews/:reviewId`
*   **Auth:** Owner or Admin/Supporter.

---

## 5. Search (Elasticsearch)

### Advanced Search
**POST** `/api/search/products`

*   **Query Params:**
    *   `q` (string): Search keywords.
    *   `category` (string): Category slug.
    *   `brand` (string/array): List of brands.
    *   `minPrice`, `maxPrice` (number)
    *   `minDiscount` (number)
    *   `inStock` (boolean)
    *   `sortBy` (string): `relevance` (default), `price_asc`, `price_desc`, `newest`, `rating`, `name_asc`.
    *   `page`, `limit`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "products": [...],
        "aggregations": {
          "brands": [{ "key": "Asus", "doc_count": 10 }, ...],
          "categories": [...],
          "priceRanges": [...]
        },
        "meta": { "page": 1, "limit": 12, "total": 50 }
      }
    }
    ```

### Autocomplete
**GET** `/api/search/autocomplete`
*   **Query:** `q` (required, min 2 chars), `limit` (optional).
*   **Response:** `{ "data": ["keyword 1", "keyword 2"] }`

### Related Products
**GET** `/api/search/related/:productId`
*   **Query:** `limit` (default 6).

### Search Filters
**GET** `/api/search/filters`
*   **Description:** Get available brands, categories, and price ranges for sidebar UI.

---

## 6. Wishlist (Auth)

### Get Wishlist
**GET** `/api/wishlist`
*   **Query:** `page`, `limit`.
*   **Response:** List of wishlist items with product info.

### Add to Wishlist
**POST** `/api/wishlist`
*   **Body:** `{ "productId": 1 }`
*   **Response:** Created item or existing one.

### Remove from Wishlist
**DELETE** `/api/wishlist/:productId`
*   **Response:** Success message.

---

## 7. Categories

### List Categories
**GET** `/api/categories`

*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "Office Laptops",
          "slug": "office-laptops",
          "productCount": 15
        },
        ...
      ]
    }
    ```

### Manage Categories (Admin/Supporter)
*   **Create:** `POST /api/categories` (Body: `name`, `description`, `isActive`)
*   **Update:** `PUT /api/categories/:id`
*   **Delete:** `DELETE /api/categories/:id`

---

## 8. Orders

### Create Order
**POST** `/api/orders`
*   **Auth:** Required.
*   **Body:**
    *   `items` (array, required): `[{ "productId": 1, "quantity": 2 }]`
    *   `recipientName` (string, required, min 2 chars)
    *   `shippingAddress` (string, required, min 10 chars)
    *   `contactPhone` (string, required, min 8 chars)
    *   `paymentMethod` (string, optional): `COD` (default) or `BANK_TRANSFER`.
    *   `notes` (string, optional)
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": 101,
        "totalAmount": 25000000,
        "status": "PENDING",
        "items": [...]
      }
    }
    ```

### Get My Orders
**GET** `/api/orders/my`
*   **Auth:** Required.
*   **Params:** `page`, `limit`.
*   **Response:** List of user's orders.

### Get Order Detail
**GET** `/api/orders/:orderId`
*   **Auth:** Owner or Admin/Supporter.

### Manage Orders (Admin/Supporter)
*   **List All:** `GET /api/orders` (Params: `status`, `search`, `page`, `limit`)
*   **Update Status:** `PATCH /api/orders/:orderId/status`
    *   **Body:** `{ "status": "SHIPPED" }` (Valid: `PENDING`, `CONFIRMED`, `SHIPPED`, `COMPLETED`, `CANCELLED`).

---

## 9. Admin Management

### Dashboard Stats
**GET** `/api/admin/stats/dashboard`
*   **Auth:** Admin/Supporter.
*   **Response:**
    ```json
    {
      "data": {
        "revenue": 10000000,
        "orders": { "total": 50, "pending": 5 },
        "users": { "total": 100 },
        "products": { "lowStock": 2 }
      }
    }
    ```

### List Users
**GET** `/api/admin/users`
*   **Auth:** Admin/Supporter.
*   **Params:** `page`, `limit`, `search` (email/name), `role`.

### Update Role
**PATCH** `/api/admin/users/:userId/role`
*   **Auth:** Admin/Supporter.
*   **Body:** `{ "roleId": "ADMIN" }` (Cannot update self).

---

## 10. GraphQL API (Shopping Cart)

**Endpoint:** `POST /graphql`
**Auth:** `Authorization: Bearer <accessToken>` required for cart operations.

### Types
*   **Cart**: `id`, `userId`, `items` (List of CartItem), `total` (Float).
*   **CartItem**: `id`, `quantity`, `isSelected`, `product` (Product), `subtotal`.
*   **Product**: `id`, `name`, `price`, `discountPercent`, `stock`, `images`.

### Operations

#### 1. Get Cart
Fetch the current user's cart.
```graphql
query GetCart {
  cart {
    id
    total
    items {
      id
      quantity
      isSelected
      subtotal
      product {
        id
        name
        price
        images
        stock
      }
    }
  }
}
```

#### 2. Add to Cart
Add a product or increase quantity if exists.
```graphql
mutation AddToCart {
  addToCart(productId: "1", quantity: 1) {
    id
    items {
      id
      quantity
      product { name }
    }
  }
}
```

#### 3. Update Cart Item
Update quantity of a specific line item.
```graphql
mutation UpdateItem {
  updateCartItem(itemId: "10", quantity: 3) {
    id
    total
    items { id quantity subtotal }
  }
}
```

#### 4. Remove from Cart
Remove an item completely.
```graphql
mutation RemoveItem {
  removeFromCart(itemId: "10") {
    id
    items { id }
  }
}
```

#### 5. Select Items for Checkout
Select specific items (e.g., based on checkboxes) to calculate total or prepare for order.
```graphql
mutation SelectItems {
  selectCartItems(itemIds: ["10", "11"], isSelected: true) {
    id
    total
    items { id isSelected }
  }
}
```