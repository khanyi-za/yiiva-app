# Search API Specification for Backend Implementation

**Date:** October 17, 2025
**Status:** Frontend Ready - Awaiting Backend Implementation
**Frontend File:** `lib/api-client.ts` (lines 406-595)

---

## Overview

The mobile app now has search API client functions ready. The backend team needs to implement these 4 new REST API endpoints to enable search functionality.

**Search Requirements:**
- Search by product **category** (category, clothingType fields)
- Search by **smart category** (AI-generated: smartCategory1-3 fields)
- Search by **merchant name** (username, displayName fields)
- **Combined search** (all of the above)

---

## 1. Combined Search Endpoint

**Frontend Function:** `api.searchProducts()`

### Endpoint
```
GET /api/products/search
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query string |
| `genderType` | string | No | Filter by gender: 'women', 'men', 'unisex' |
| `limit` | number | No | Results per page (default: 20) |
| `offset` | number | No | Pagination offset (default: 0) |

### Example Request
```
GET /api/products/search?q=dress&genderType=women&limit=20&offset=0
```

### Database Query Logic
```sql
SELECT p.*, m.username, m.displayName, m.logo, m.isVerified
FROM products p
JOIN merchants m ON p.merchantId = m.id
WHERE p.isActive = true
AND (
  -- Product fields
  p.name LIKE '%dress%'
  OR p.category LIKE '%dress%'
  OR p.clothingType LIKE '%dress%'
  OR p.smartCategory1 LIKE '%dress%'
  OR p.smartCategory2 LIKE '%dress%'
  OR p.smartCategory3 LIKE '%dress%'
  -- Merchant fields
  OR m.username LIKE '%dress%'
  OR m.displayName LIKE '%dress%'
)
AND (p.genderType = 'women' OR 'women' IS NULL) -- If genderType provided
ORDER BY
  -- Relevance scoring (optional but recommended)
  CASE
    WHEN p.name LIKE '%dress%' THEN 1
    WHEN p.category LIKE '%dress%' THEN 2
    WHEN m.displayName LIKE '%dress%' THEN 3
    ELSE 4
  END,
  p.createdAt DESC
LIMIT 20 OFFSET 0;
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "cmg123...",
        "name": "The Bonang dress",
        "price": 1899.0,
        "currency": "ZAR",
        "primaryImage": "The_Bonang_dress_1.png",
        "category": "Dresses",
        "clothingType": "Dresses",
        "genderType": "women",
        "merchant": {
          "id": "merchant123...",
          "username": "tol_thema",
          "displayName": "Tol'thema",
          "logo": "tol'thema-logo.png",
          "isVerified": false
        }
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 45,
      "hasMore": true
    }
  }
}
```

---

## 2. Category Search Endpoint

**Frontend Function:** `api.searchByCategory()`

### Endpoint
```
GET /api/products/search/category
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | Yes | Category to search for |
| `genderType` | string | No | Filter by gender: 'women', 'men', 'unisex' |
| `limit` | number | No | Results per page (default: 20) |
| `offset` | number | No | Pagination offset (default: 0) |

### Example Request
```
GET /api/products/search/category?category=Tops&genderType=men&limit=20&offset=0
```

### Database Query Logic
```sql
SELECT p.*, m.username, m.displayName, m.logo, m.isVerified
FROM products p
JOIN merchants m ON p.merchantId = m.id
WHERE p.isActive = true
AND (
  p.category LIKE '%Tops%'
  OR p.clothingType LIKE '%Tops%'
)
AND (p.genderType = 'men' OR 'men' IS NULL)
ORDER BY p.createdAt DESC
LIMIT 20 OFFSET 0;
```

### Expected Response
Same structure as combined search endpoint.

---

## 3. Smart Category Search Endpoint

**Frontend Function:** `api.searchBySmartCategory()`

### Endpoint
```
GET /api/products/search/smart-category
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `smartCategory` | string | Yes | Smart category to search for |
| `genderType` | string | No | Filter by gender: 'women', 'men', 'unisex' |
| `limit` | number | No | Results per page (default: 20) |
| `offset` | number | No | Pagination offset (default: 0) |

### Example Request
```
GET /api/products/search/smart-category?smartCategory=streetwear&limit=20&offset=0
```

### Database Query Logic
```sql
SELECT p.*, m.username, m.displayName, m.logo, m.isVerified
FROM products p
JOIN merchants m ON p.merchantId = m.id
WHERE p.isActive = true
AND (
  p.smartCategory1 LIKE '%streetwear%'
  OR p.smartCategory2 LIKE '%streetwear%'
  OR p.smartCategory3 LIKE '%streetwear%'
)
AND (p.genderType IS NULL OR p.genderType = '' OR 'genderType' IS NULL)
ORDER BY p.createdAt DESC
LIMIT 20 OFFSET 0;
```

### Expected Response
Same structure as combined search endpoint.

---

## 4. Merchant Name Search Endpoint

**Frontend Function:** `api.searchByMerchantName()`

### Endpoint
```
GET /api/products/search/merchant
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `merchantName` | string | Yes | Merchant name to search for |
| `genderType` | string | No | Filter by gender: 'women', 'men', 'unisex' |
| `limit` | number | No | Results per page (default: 20) |
| `offset` | number | No | Pagination offset (default: 0) |

### Example Request
```
GET /api/products/search/merchant?merchantName=suhu&limit=20&offset=0
```

### Database Query Logic
```sql
SELECT p.*, m.username, m.displayName, m.logo, m.isVerified
FROM products p
JOIN merchants m ON p.merchantId = m.id
WHERE p.isActive = true
AND (
  m.username LIKE '%suhu%'
  OR m.displayName LIKE '%suhu%'
)
AND (p.genderType IS NULL OR p.genderType = '' OR 'genderType' IS NULL)
ORDER BY p.createdAt DESC
LIMIT 20 OFFSET 0;
```

### Expected Response
Same structure as combined search endpoint.

---

## Implementation Notes

### 1. Case-Insensitive Search
All LIKE searches should be case-insensitive:

**SQLite:**
```sql
WHERE LOWER(p.name) LIKE LOWER('%dress%')
```

**PostgreSQL:**
```sql
WHERE p.name ILIKE '%dress%'
```

**Prisma (Recommended):**
```typescript
where: {
  name: {
    contains: searchQuery,
    mode: 'insensitive'
  }
}
```

### 2. Product Response Structure
Each product in the response must include:
- Product ID, name, price, currency
- `primaryImage` - First image from `selectedFiles` JSON array
- `category`, `clothingType`, `genderType`
- Nested `merchant` object with: id, username, displayName, logo, isVerified

### 3. Pagination
- Always return pagination metadata
- `total`: Total count of matching products
- `hasMore`: Boolean indicating if more results exist
- Frontend will use this for infinite scroll

### 4. Performance Considerations
- Add indexes on searched fields (already recommended in database_schema.md):
  ```sql
  CREATE INDEX "idx_products_category" ON "products"("category");
  CREATE INDEX "idx_products_clothingType" ON "products"("clothingType");
  CREATE INDEX "idx_products_genderType" ON "products"("genderType");
  CREATE INDEX "idx_products_name" ON "products"("name");
  ```

- For PostgreSQL production, consider full-text search:
  ```sql
  CREATE INDEX "idx_products_search" ON "products"
    USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
  ```

### 5. Error Handling
Return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUERY",
    "message": "Search query must be at least 2 characters"
  }
}
```

Common error codes:
- `INVALID_QUERY` - Query too short or malformed
- `NO_RESULTS` - No products found (still return 200 with empty array)
- `DATABASE_ERROR` - Internal database error

---

## Prisma Implementation Example

Here's a suggested Prisma implementation for the combined search endpoint:

```typescript
// products.service.ts

async searchProducts(params: {
  query: string;
  genderType?: string;
  limit: number;
  offset: number;
}) {
  const { query, genderType, limit, offset } = params;

  // Build where clause
  const whereClause: any = {
    isActive: true,
    OR: [
      // Product fields
      { name: { contains: query, mode: 'insensitive' } },
      { category: { contains: query, mode: 'insensitive' } },
      { clothingType: { contains: query, mode: 'insensitive' } },
      { smartCategory1: { contains: query, mode: 'insensitive' } },
      { smartCategory2: { contains: query, mode: 'insensitive' } },
      { smartCategory3: { contains: query, mode: 'insensitive' } },
      // Merchant fields
      {
        merchant: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
          ],
        },
      },
    ],
  };

  // Add gender filter if provided
  if (genderType) {
    whereClause.genderType = genderType;
  }

  // Execute query with pagination
  const [products, total] = await Promise.all([
    this.prisma.product.findMany({
      where: whereClause,
      include: {
        merchant: {
          select: {
            id: true,
            username: true,
            displayName: true,
            logo: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    this.prisma.product.count({ where: whereClause }),
  ]);

  // Transform response
  return {
    products: products.map(this.transformProductToResponse),
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + products.length < total,
    },
  };
}
```

---

## Testing Checklist

Before marking implementation as complete, test:

- [ ] Search by product name (e.g., "Bonang")
- [ ] Search by category (e.g., "Dresses", "Tops")
- [ ] Search by merchant name (e.g., "tol_thema", "SUHU")
- [ ] Search by smart category (e.g., "streetwear")
- [ ] Case-insensitive search works (e.g., "DRESS" finds "dress")
- [ ] Gender filter works correctly
- [ ] Pagination works (limit & offset)
- [ ] Empty query returns appropriate error
- [ ] No results returns empty array with pagination
- [ ] Response includes all required product fields
- [ ] Response includes nested merchant object

---

## Frontend Status

✅ **Frontend API client functions are READY**
✅ **TypeScript types defined**
✅ **Error handling implemented**
⏳ **Waiting for backend endpoints**

Once backend endpoints are implemented, the mobile app will automatically start using them for search functionality.

---

## Questions?

Contact the mobile app team if you need clarification on:
- Expected response structure
- Pagination behavior
- Error handling requirements
- Performance considerations
