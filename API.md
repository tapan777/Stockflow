# StockFlow — API Documentation

**Base URL (Production):** `https://stockflow-1-pacv.onrender.com/api`  
**Base URL (Local Dev):** `http://localhost:3001/api`

---

## Authentication

All protected routes require a **Bearer token** in the `Authorization` header.

```
Authorization: Bearer <your_jwt_token>
```

Tokens are returned on login and signup. They expire after **7 days**.

---

## Response Format

Every response follows this envelope:

```json
{
  "success": true | false,
  "message": "Human-readable result message",
  "data": { ... }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK — successful GET / PUT / DELETE |
| `201` | Created — successful POST |
| `400` | Bad Request — validation error |
| `401` | Unauthorized — missing or invalid token |
| `404` | Not Found — resource does not exist |
| `409` | Conflict — duplicate email or SKU |
| `500` | Internal Server Error |

---

## Auth Endpoints

### POST `/auth/signup`
Register a new user and create an organization.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "organizationName": "My Store"
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Welcome to StockFlow! Your account has been created.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "organizationId": 1,
      "organizationName": "My Store"
    }
  }
}
```

**Errors**
| Status | Message |
|--------|---------|
| `400` | Email, password, and organization name are required |
| `400` | Password must be at least 6 characters |
| `409` | This email is already registered |

---

### POST `/auth/login`
Authenticate an existing user.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Welcome back, My Store!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "organizationId": 1,
      "organizationName": "My Store"
    }
  }
}
```

**Errors**
| Status | Message |
|--------|---------|
| `400` | Email and password are required |
| `401` | Invalid email or password |

---

### GET `/auth/me` 🔒
Get the currently authenticated user.

**Response `200`**
```json
{
  "success": true,
  "message": "User retrieved",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "organizationId": 1,
    "organizationName": "My Store"
  }
}
```

---

### POST `/auth/logout` 🔒
Invalidate the current session.

**Response `200`**
```json
{
  "success": true,
  "message": "You have been logged out successfully",
  "data": null
}
```

---

## Product Endpoints

> All product endpoints require authentication 🔒  
> All data is automatically scoped to the authenticated user's organization.

---

### GET `/products`
List all products. Optionally filter by name or SKU.

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string (optional) | Filter by name or SKU (case-insensitive) |

**Example:** `GET /products?search=shirt`

**Response `200`**
```json
{
  "success": true,
  "message": "5 product(s) retrieved",
  "data": [
    {
      "id": 1,
      "organization_id": 1,
      "name": "Blue T-Shirt",
      "sku": "SKU-001",
      "description": "Cotton blend",
      "quantity_on_hand": 50,
      "cost_price": 5.00,
      "selling_price": 19.99,
      "low_stock_threshold": 10,
      "created_at": "2025-06-01T10:00:00.000Z",
      "updated_at": "2025-06-01T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/products/:id`
Get a single product by ID.

**Response `200`**
```json
{
  "success": true,
  "message": "Product retrieved",
  "data": {
    "id": 1,
    "name": "Blue T-Shirt",
    "sku": "SKU-001",
    "quantity_on_hand": 50,
    ...
  }
}
```

**Errors**
| Status | Message |
|--------|---------|
| `404` | Product not found |

---

### POST `/products`
Create a new product.

**Request Body**
```json
{
  "name": "Blue T-Shirt",
  "sku": "SKU-001",
  "description": "Cotton blend",
  "quantity_on_hand": 50,
  "cost_price": 5.00,
  "selling_price": 19.99,
  "low_stock_threshold": 10
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✅ |
| `sku` | string | ✅ (unique per org) |
| `description` | string | ❌ |
| `quantity_on_hand` | integer | ✅ |
| `cost_price` | number | ❌ |
| `selling_price` | number | ❌ |
| `low_stock_threshold` | integer | ❌ (uses global default if omitted) |

**Response `201`**
```json
{
  "success": true,
  "message": "Product \"Blue T-Shirt\" created successfully",
  "data": { "id": 1, "name": "Blue T-Shirt", "sku": "SKU-001", ... }
}
```

**Errors**
| Status | Message |
|--------|---------|
| `400` | Name and SKU are required |
| `409` | SKU "SKU-001" already exists in your organization |

---

### PUT `/products/:id`
Update an existing product (all fields).

**Request Body** — same fields as POST `/products`

**Response `200`**
```json
{
  "success": true,
  "message": "Product \"Blue T-Shirt\" updated successfully",
  "data": { ... }
}
```

**Errors**
| Status | Message |
|--------|---------|
| `404` | Product not found |
| `409` | SKU already exists in your organization |

---

### DELETE `/products/:id`
Permanently delete a product.

**Response `200`**
```json
{
  "success": true,
  "message": "Product \"Blue T-Shirt\" deleted successfully",
  "data": null
}
```

**Errors**
| Status | Message |
|--------|---------|
| `404` | Product not found |

---

### POST `/products/:id/adjust`
Adjust the quantity on hand by a positive or negative amount.

**Request Body**
```json
{
  "adjustment": 10
}
```

Use a **positive number** to add stock, **negative** to reduce.

| Field | Type | Required |
|-------|------|----------|
| `adjustment` | integer (non-zero) | ✅ |

**Response `200`**
```json
{
  "success": true,
  "message": "Stock increased — \"Blue T-Shirt\" now has 60 units",
  "data": { "id": 1, "quantity_on_hand": 60, ... }
}
```

**Errors**
| Status | Message |
|--------|---------|
| `400` | A non-zero adjustment value is required |
| `404` | Product not found |

---

## Dashboard Endpoint

### GET `/dashboard` 🔒
Get inventory summary and low-stock items for the authenticated organization.

**Response `200`**
```json
{
  "success": true,
  "message": "Dashboard data retrieved",
  "data": {
    "totalProducts": 12,
    "totalUnits": 430,
    "lowStockCount": 3,
    "defaultThreshold": 5,
    "lowStockItems": [
      {
        "id": 4,
        "name": "Red Cap",
        "sku": "CAP-RED",
        "quantity_on_hand": 2,
        "low_stock_threshold": 5
      }
    ]
  }
}
```

---

## Settings Endpoint

### GET `/settings` 🔒
Get organization settings.

**Response `200`**
```json
{
  "success": true,
  "message": "Settings retrieved",
  "data": {
    "organizationName": "My Store",
    "defaultLowStockThreshold": 5
  }
}
```

---

### PUT `/settings` 🔒
Update the global low stock threshold.

**Request Body**
```json
{
  "defaultLowStockThreshold": 10
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Settings saved successfully",
  "data": {
    "organizationName": "My Store",
    "defaultLowStockThreshold": 10
  }
}
```

**Errors**
| Status | Message |
|--------|---------|
| `400` | Threshold must be a number greater than or equal to 0 |

---

## Quick Test (cURL)

```bash
# 1. Signup
curl -X POST https://stockflow-1-pacv.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@demo.com","password":"pass123","organizationName":"Demo Store"}'

# 2. Login and save token
TOKEN=$(curl -s -X POST https://stockflow-1-pacv.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@demo.com","password":"pass123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

# 3. Create a product
curl -X POST https://stockflow-1-pacv.onrender.com/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Blue T-Shirt","sku":"SKU-001","quantity_on_hand":50,"selling_price":19.99}'

# 4. View dashboard
curl https://stockflow-1-pacv.onrender.com/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```
