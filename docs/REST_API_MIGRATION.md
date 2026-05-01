# Yiiva REST API Specification

**Version:** 1.0.0
**Backend:** NestJS + Prisma
**Database:** SQLite (Dev) / PostgreSQL (Prod)
**Last Updated:** 2025-10-09
**Status:** Specification Complete - Awaiting Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Conventions](#api-conventions)
3. [Endpoints](#endpoints)
4. [Data Transformation Requirements](#data-transformation-requirements)
5. [Static Asset Serving](#static-asset-serving)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Implementation Checklist](#implementation-checklist)

---

## 📖 Overview

This document specifies the REST API endpoints required for the Yiiva mobile application (React Native). It is intended for **backend engineers** implementing the NestJS + Prisma backend.

**Related Documentation:**
- **Frontend Implementation:** `docs/mobile_app_documentation.md` (React Native details)
- **Database Schema:** `docs/database_schema.md` (Prisma schema, table definitions)

---

## 🔧 API Conventions

### Base URL

```
Development: http://localhost:3000/api
Production:  https://api.yiiva.co/api
```

### Response Format

All endpoints return a consistent JSON structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "pagination": {  // Optional, for paginated endpoints
    "limit": 20,
    "offset": 0,
    "total": 150,
    "hasMore": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_GENDER_TYPE",
    "message": "Gender type must be 'women', 'men', or 'unisex'"
  }
}
```

### HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| `200` | OK | Successful GET/POST/PUT request |
| `201` | Created | Successful resource creation |
| `400` | Bad Request | Invalid parameters |
| `404` | Not Found | Resource doesn't exist |
| `500` | Internal Server Error | Unexpected server error |

---

## 🎯 Endpoints

### 1. GET `/api/products/feed`

**Purpose:** Main product feed for home screen, filtered by gender type.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `genderType` | `string` | Yes | - | Filter: `women`, `men`, or `unisex` |
| `limit` | `number` | No | `20` | Number of products to return |
| `offset` | `number` | No | `0` | Pagination offset |

**Database Query (Prisma Example):**

```typescript
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    genderType: genderType,  // 'women', 'men', or 'unisex'
  },
  include: {
    merchant: {
      select: {
        id: true,
        username: true,        // REQUIRED for mobile navigation
        displayName: true,
        logo: true,            // Can be null
        isVerified: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: limit,
  skip: offset,
});

// Transform products (see Data Transformation section)
const transformedProducts = products.map(product => transformProduct(product));
```

**Response Schema:**

```typescript
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "cmg0mhild000xw4k8vizp2ox3",
        "name": "Plain Lindy Dress",
        "price": 1700,
        "currency": "ZAR",
        "primaryImage": "http://localhost:3000/demo-assets/Plain%20Lindy%20Dress.png",
        "merchant": {
          "id": "merchant_id",
          "username": "tol_thema",      // CRITICAL: Required for /artist/[username] navigation
          "displayName": "Tol'thema",
          "logo": "http://localhost:3000/demo-assets/tol_thema_logo.png",  // OR null
          "isVerified": false
        },
        "category": "Dresses",
        "clothingType": "Dresses",
        "genderType": "women"
      }
      // ... 19 more products
    ]
  },
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "hasMore": true
  }
}
```

**Example Request:**

```bash
curl http://localhost:3000/api/products/feed?genderType=women&limit=5&offset=0
```

---

### 2. GET `/api/products/featured`

**Purpose:** Random featured products for horizontal carousel (discovery).

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | `number` | No | `6` | Number of products to return |

**Database Query (Prisma Example):**

```typescript
// Random selection - SQLite uses RANDOM(), PostgreSQL uses RANDOM()
const products = await prisma.$queryRaw`
  SELECT
    p.id,
    p.name,
    p.price,
    p.currency,
    p.selectedFiles,
    m.displayName
  FROM products p
  JOIN merchants m ON p.merchantId = m.id
  WHERE p.isActive = true
  ORDER BY RANDOM()
  LIMIT ${limit}
`;

// Transform products (see Data Transformation section)
const transformedProducts = products.map(product => transformCarouselProduct(product));
```

**Response Schema:**

```typescript
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product_id",
        "name": "Product Name",
        "price": 1399,
        "currency": "ZAR",
        "image": "http://localhost:3000/demo-assets/product_image.png",
        "merchant": {
          "displayName": "Tol'thema"
        }
      }
      // ... 5 more
    ]
  }
}
```

**Example Request:**

```bash
curl http://localhost:3000/api/products/featured?limit=6
```

---

### 3. GET `/api/products/new-arrivals`

**Purpose:** Newest products filtered by gender type for horizontal carousel.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `genderType` | `string` | Yes | - | Filter: `women`, `men`, or `unisex` |
| `limit` | `number` | No | `6` | Number of products to return |

**Database Query (Prisma Example):**

```typescript
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    genderType: genderType,
  },
  include: {
    merchant: {
      select: {
        displayName: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',  // Newest first
  },
  take: limit,
});

// Transform products (see Data Transformation section)
const transformedProducts = products.map(product => transformCarouselProduct(product));
```

**Response Schema:**

Same as Featured Products (simplified product object).

**Example Request:**

```bash
curl http://localhost:3000/api/products/new-arrivals?genderType=women&limit=6
```

---

## 🔄 Data Transformation Requirements

### Critical Concept: selectedFiles JSON Parsing

**Database Schema:**

The `products.selectedFiles` field stores a JSON string array:

```json
{
  "selectedFiles": "[\"Plain Lindy Dress.png\", \"Plain Lindy Dress 2.png\", \"Video.mp4\"]"
}
```

**Mobile App Expectation:**

- **Home Feed:** ONE image per product (first from array)
- **Product Detail:** ALL images/videos (future endpoint)

### Transformation Function (Main Feed)

```typescript
function transformProduct(product: any) {
  // 1. Parse selectedFiles JSON string to array
  const files = JSON.parse(product.selectedFiles || '[]');

  // 2. Take FIRST file as primary image
  const primaryImageFile = files[0] || null;

  // 3. Construct full URL for primary image
  const primaryImage = primaryImageFile
    ? `${process.env.BASE_URL}/demo-assets/${encodeURIComponent(primaryImageFile)}`
    : null;

  // 4. Construct full URL for merchant logo (if exists)
  const merchantLogo = product.merchant.logo
    ? `${process.env.BASE_URL}/demo-assets/${encodeURIComponent(product.merchant.logo)}`
    : null;

  // 5. Return transformed product
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency,
    primaryImage,  // ✅ SINGLE URL, not array
    merchant: {
      id: product.merchant.id,
      username: product.merchant.username,  // ✅ REQUIRED
      displayName: product.merchant.displayName,
      logo: merchantLogo,  // ✅ Can be null
      isVerified: product.merchant.isVerified,
    },
    category: product.category,
    clothingType: product.clothingType,
    genderType: product.genderType,
  };
}
```

### Transformation Function (Carousel Products)

```typescript
function transformCarouselProduct(product: any) {
  const files = JSON.parse(product.selectedFiles || '[]');
  const imageFile = files[0] || null;

  const image = imageFile
    ? `${process.env.BASE_URL}/demo-assets/${encodeURIComponent(imageFile)}`
    : null;

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency,
    image,  // ✅ SINGLE URL
    merchant: {
      displayName: product.displayName,  // Simplified merchant info
    },
  };
}
```

### Why Only First Image?

1. **Performance:** Home feed shows 20+ products
2. **UX:** Static image (like Instagram feed)
3. **Bandwidth:** Reduces data transfer
4. **Future:** Product Detail endpoint will return ALL images/videos

---

## 📦 Static Asset Serving

### Requirements

All product images and merchant logos are stored in the `/demo-assets/` directory and must be accessible via HTTP.

### NestJS Configuration

**File:** `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from demo-assets directory
  app.useStaticAssets(join(__dirname, '..', 'demo-assets'), {
    prefix: '/demo-assets/',
  });

  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
```

### URL Format

**Filename in database:** `Plain Lindy Dress.png`
**URL returned by API:** `http://localhost:3000/demo-assets/Plain%20Lindy%20Dress.png`

**Important:**
- Use `encodeURIComponent()` for filenames with spaces
- Handle missing files gracefully (return `null`)
- Verify images are accessible: `curl http://localhost:3000/demo-assets/filename.png`

---

## ⚠️ Error Handling

### Validation Errors

**Invalid `genderType`:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_GENDER_TYPE",
    "message": "Gender type must be 'women', 'men', or 'unisex'. Received: 'invalid'"
  }
}
```

**Invalid Pagination:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_LIMIT",
    "message": "Limit must be between 1 and 100"
  }
}
```

### Empty Results

**No products found:**
```json
{
  "success": true,
  "data": {
    "products": []
  },
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 0,
    "hasMore": false
  }
}
```

### Null Handling

**Product with no images:**
```json
{
  "primaryImage": null  // ✅ Valid - mobile handles gracefully
}
```

**Merchant with no logo:**
```json
{
  "merchant": {
    "logo": null  // ✅ Valid - mobile handles gracefully
  }
}
```

### Database Errors

**Prisma query fails:**
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Unable to fetch products"
  }
}
```

**Best Practice:** Log full error internally, return generic message to client.

---

## 🧪 Testing

### Manual Testing with curl

**Test Main Feed:**
```bash
# Get women's products
curl http://localhost:3000/api/products/feed?genderType=women&limit=5

# Get men's products
curl http://localhost:3000/api/products/feed?genderType=men&limit=5

# Test pagination
curl http://localhost:3000/api/products/feed?genderType=women&limit=5&offset=5

# Test invalid gender type
curl http://localhost:3000/api/products/feed?genderType=invalid
```

**Test Featured Products:**
```bash
curl http://localhost:3000/api/products/featured?limit=6
```

**Test New Arrivals:**
```bash
curl http://localhost:3000/api/products/new-arrivals?genderType=women&limit=6
```

**Test Static Assets:**
```bash
# Verify image accessible
curl -I http://localhost:3000/demo-assets/Plain%20Lindy%20Dress.png
```

### Response Validation Checklist

For each endpoint, verify:

- [ ] `success: true` in response
- [ ] `data` object present
- [ ] `primaryImage` or `image` is full URL (not filename)
- [ ] `merchant.username` present (main feed only)
- [ ] `merchant.logo` is full URL or `null`
- [ ] Price is number (not string)
- [ ] Images accessible in browser
- [ ] Pagination object correct (main feed only)
- [ ] Empty results return empty array (not error)
- [ ] Invalid params return error with code

---

## ✅ Implementation Checklist

### Endpoint 1: `/api/products/feed`

- [ ] Create NestJS controller method
- [ ] Accept query params: `genderType`, `limit`, `offset`
- [ ] Validate `genderType` (women/men/unisex)
- [ ] Validate `limit` (1-100) and `offset` (>=0)
- [ ] Query Prisma: `WHERE isActive = true AND genderType = X`
- [ ] JOIN merchants table
- [ ] Parse `selectedFiles` JSON → take first file
- [ ] Transform filename to full URL
- [ ] Transform merchant logo to full URL (or null)
- [ ] Calculate pagination (`total`, `hasMore`)
- [ ] Return response with success, data, pagination
- [ ] Handle errors with proper error codes
- [ ] Test with curl

### Endpoint 2: `/api/products/featured`

- [ ] Create NestJS controller method
- [ ] Accept query param: `limit`
- [ ] Validate `limit` (1-100)
- [ ] Query Prisma: `WHERE isActive = true ORDER BY RANDOM()`
- [ ] JOIN merchants table
- [ ] Parse `selectedFiles` JSON → take first file
- [ ] Transform filename to full URL
- [ ] Return simplified response (no pagination)
- [ ] Handle errors with proper error codes
- [ ] Test with curl

### Endpoint 3: `/api/products/new-arrivals`

- [ ] Create NestJS controller method
- [ ] Accept query params: `genderType`, `limit`
- [ ] Validate `genderType` and `limit`
- [ ] Query Prisma: `WHERE isActive = true AND genderType = X ORDER BY createdAt DESC`
- [ ] JOIN merchants table
- [ ] Parse `selectedFiles` JSON → take first file
- [ ] Transform filename to full URL
- [ ] Return simplified response (no pagination)
- [ ] Handle errors with proper error codes
- [ ] Test with curl

### Static Asset Serving

- [ ] Configure `app.useStaticAssets()` in `main.ts`
- [ ] Verify `/demo-assets/` directory exists
- [ ] Test image accessibility: `curl -I http://localhost:3000/demo-assets/test.png`
- [ ] Handle URL encoding for filenames with spaces

### Error Handling

- [ ] Return consistent error format: `{ success: false, error: { code, message } }`
- [ ] Validate all query parameters
- [ ] Handle Prisma errors gracefully
- [ ] Handle missing images (return `null`)
- [ ] Handle empty results (return empty array)

### Testing

- [ ] Test all endpoints with valid params
- [ ] Test invalid params (expect error responses)
- [ ] Test pagination (offset, limit)
- [ ] Test empty results
- [ ] Test with mobile app (iOS simulator)
- [ ] Test with mobile app (Android emulator)

---

## 📚 Related Documentation

- **Frontend Implementation:** `docs/mobile_app_documentation.md`
- **Database Schema:** `docs/database_schema.md`
- **User Flows:** `docs/user-flow-and-screen-details.md`

---

## 🔗 Support

**Questions about:**
- API contract → This document
- Mobile app implementation → `mobile_app_documentation.md`
- Database schema → `database_schema.md`

---

**Specification Version:** 1.0.0
**Last Updated:** 2025-10-09
**Maintained By:** Backend Team
**Status:** Ready for Implementation
