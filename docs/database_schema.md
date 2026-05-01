# Yiiva Database Schema Documentation

*Last Updated: October 8, 2025*
*Database Type: SQLite (Development) / PostgreSQL (Production)*
*ORM: Prisma v6.15.0*

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Definitions](#table-definitions)
4. [Field Specifications](#field-specifications)
5. [Relationships & Foreign Keys](#relationships--foreign-keys)
6. [Indexes](#indexes)
7. [Data Types & Constraints](#data-types--constraints)
8. [Current Database State](#current-database-state)
9. [JSON Field Structures](#json-field-structures)
10. [Best Practices & Guidelines](#best-practices--guidelines)

---

## 🎯 Overview

The Yiiva database is designed to support a social commerce platform connecting South African creative merchants with consumers. The schema is optimized for:

- **Content-as-catalog** philosophy
- **Instagram-style** product discovery
- **Made-to-order** inventory management
- **South African market** (ZAR currency, local locations)
- **AI-powered** smart categorization

### Core Entities

| Entity | Purpose | Record Count |
|--------|---------|--------------|
| **Merchants** | Fashion brands, artists, designers | 2 |
| **Products** | Catalog items with media & metadata | 16 |
| **Orders** | Customer purchase records | 0 |
| **Collections** | Curated product groupings | 0 |
| **CollectionProducts** | Many-to-many collection-product links | 0 |

---

## 🗺️ Entity Relationship Diagram

```
┌─────────────────┐
│    Merchant     │
│                 │
│  PK: id         │
│  UK: username   │
│  UK: email      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐           ┌──────────────────┐
│     Product     │───────────│  CollectionProduct│
│                 │    N:M    │                   │
│  PK: id         │◄──────────│  PK: collectionId,│
│  FK: merchantId │           │      productId    │
└────────┬────────┘           └────────┬──────────┘
         │                             │
         │ 1:N                         │ N:1
         │                             │
         ▼                             ▼
┌─────────────────┐           ┌──────────────────┐
│      Order      │           │    Collection    │
│                 │           │                  │
│  PK: id         │           │  PK: id          │
│  UK: orderNumber│           └──────────────────┘
│  FK: merchantId │
│  FK: productId  │
└─────────────────┘
```

---

## 📊 Table Definitions

### 1. merchants

Stores information about creative merchants (fashion brands, artists, craftspeople).

**Table Name:** `merchants`
**Primary Key:** `id` (TEXT, CUID)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | TEXT | NO | cuid() | Unique merchant identifier |
| `username` | TEXT | NO | - | Unique username (URL-safe) |
| `displayName` | TEXT | NO | - | Public display name |
| `email` | TEXT | NO | - | Contact email (unique) |
| `businessType` | TEXT | NO | 'fashion_brand' | Business category |
| `bio` | TEXT | YES | NULL | Merchant biography/description |
| `location` | TEXT | NO | - | City, Country format |
| `logo` | TEXT | YES | NULL | Logo filename (stored in demo-assets) |
| `heroMedia` | TEXT | YES | NULL | JSON array of hero media files |
| `followerCount` | INTEGER | NO | 0 | Social follower count |
| `followingCount` | INTEGER | NO | 0 | Following count |
| `postCount` | INTEGER | NO | 0 | Total products posted |
| `isVerified` | BOOLEAN | NO | false | Verification badge status |
| `createdAt` | DATETIME | NO | now() | Record creation timestamp |
| `updatedAt` | DATETIME | NO | now() | Last update timestamp |

**Unique Constraints:**
- `username` - Must be globally unique
- `email` - Must be globally unique

**Relationships:**
- Has many `products` (1:N)
- Has many `orders` (1:N)

---

### 2. products

Catalog items with rich media, pricing, and smart categorization.

**Table Name:** `products`
**Primary Key:** `id` (TEXT, CUID)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | TEXT | NO | cuid() | Unique product identifier |
| `merchantId` | TEXT | NO | - | Foreign key to merchants table |
| `merchantUsername` | TEXT | NO | - | Denormalized for performance |
| `name` | TEXT | NO | - | Product name/title |
| `price` | REAL | NO | - | Price in South African Rand (ZAR) |
| `currency` | TEXT | NO | 'ZAR' | Currency code (ISO 4217) |
| `size` | TEXT | YES | NULL | Size range as comma-separated string |
| `category` | TEXT | NO | - | Collection/category name |
| `clothingType` | TEXT | NO | - | Type: Tops, Dresses, Pants, etc. |
| `genderType` | TEXT | NO | - | Target: women, men, unisex, kids |
| `smartCategory1` | TEXT | YES | NULL | AI-generated category (primary) |
| `smartCategory2` | TEXT | YES | NULL | AI-generated category (secondary) |
| `smartCategory3` | TEXT | YES | NULL | AI-generated category (tertiary) |
| `selectedFiles` | TEXT | YES | NULL | JSON array of product media files |
| `description` | TEXT | YES | NULL | Product description (AI-generated) |
| `inventoryType` | TEXT | NO | 'made_to_order' | Inventory model type |
| `stockQuantity` | INTEGER | YES | NULL | Available stock (if applicable) |
| `leadTime` | TEXT | YES | NULL | Production lead time |
| `isActive` | BOOLEAN | NO | true | Product visibility status |
| `createdAt` | DATETIME | NO | now() | Record creation timestamp |
| `updatedAt` | DATETIME | NO | now() | Last update timestamp |

**Foreign Keys:**
- `merchantId` → `merchants.id` (RESTRICT/CASCADE)

**Relationships:**
- Belongs to one `merchant` (N:1)
- Has many `orders` (1:N)
- Has many `collectionProducts` (1:N)

---

### 3. orders

Customer purchase records with order tracking and fulfillment details.

**Table Name:** `orders`
**Primary Key:** `id` (TEXT, CUID)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | TEXT | NO | cuid() | Unique order identifier |
| `orderNumber` | TEXT | NO | - | Human-readable order number (unique) |
| `customerName` | TEXT | NO | - | Customer full name |
| `customerEmail` | TEXT | NO | - | Customer email address |
| `customerPhone` | TEXT | YES | NULL | Customer phone number |
| `merchantId` | TEXT | NO | - | Foreign key to merchants table |
| `productId` | TEXT | NO | - | Foreign key to products table |
| `quantity` | INTEGER | NO | - | Number of items ordered |
| `totalAmount` | REAL | NO | - | Total order value in ZAR |
| `status` | TEXT | NO | - | Order status (see enum below) |
| `shippingAddress` | TEXT | YES | NULL | JSON object with address details |
| `estimatedDelivery` | DATETIME | YES | NULL | Estimated delivery date |
| `createdAt` | DATETIME | NO | now() | Order placement timestamp |
| `updatedAt` | DATETIME | NO | now() | Last status update timestamp |

**Order Status Enum Values:**
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Merchant confirmed order
- `processing` - Order in production/preparation
- `shipped` - Order shipped to customer
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled
- `refunded` - Payment refunded

**Unique Constraints:**
- `orderNumber` - Must be globally unique

**Foreign Keys:**
- `merchantId` → `merchants.id` (RESTRICT/CASCADE)
- `productId` → `products.id` (RESTRICT/CASCADE)

**Relationships:**
- Belongs to one `merchant` (N:1)
- Belongs to one `product` (N:1)

---

### 4. collections

Curated product groupings (featured collections, seasonal, trending, etc.).

**Table Name:** `collections`
**Primary Key:** `id` (TEXT, CUID)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | TEXT | NO | cuid() | Unique collection identifier |
| `name` | TEXT | NO | - | Collection name/title |
| `description` | TEXT | YES | NULL | Collection description |
| `coverImage` | TEXT | YES | NULL | Cover image filename |
| `itemCount` | INTEGER | NO | 0 | Number of products in collection |
| `isFeatured` | BOOLEAN | NO | false | Display on homepage |
| `createdAt` | DATETIME | NO | now() | Record creation timestamp |
| `updatedAt` | DATETIME | NO | now() | Last update timestamp |

**Relationships:**
- Has many `collectionProducts` (1:N)

**Collection Types (Examples):**
- Featured Collections: "Summer Vibes", "Traditional Heritage"
- Trending: "Most Liked This Week"
- Curated: "Editor's Picks", "New Arrivals"
- Seasonal: "Spring Collection 2025"
- Category-Based: "Statement Dresses", "Streetwear Essentials"

---

### 5. collection_products

Junction table for many-to-many relationship between collections and products.

**Table Name:** `collection_products`
**Composite Primary Key:** `(collectionId, productId)`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `collectionId` | TEXT | NO | - | Foreign key to collections table |
| `productId` | TEXT | NO | - | Foreign key to products table |
| `addedAt` | DATETIME | NO | now() | Timestamp when product added |

**Foreign Keys:**
- `collectionId` → `collections.id` (RESTRICT/CASCADE)
- `productId` → `products.id` (RESTRICT/CASCADE)

**Relationships:**
- Belongs to one `collection` (N:1)
- Belongs to one `product` (N:1)

---

## 🔗 Relationships & Foreign Keys

### Merchant → Product (1:N)
```sql
products.merchantId → merchants.id
ON DELETE: RESTRICT
ON UPDATE: CASCADE
```
A merchant can have many products. Deleting a merchant is restricted if products exist.

### Merchant → Order (1:N)
```sql
orders.merchantId → merchants.id
ON DELETE: RESTRICT
ON UPDATE: CASCADE
```
A merchant can have many orders. Deleting a merchant is restricted if orders exist.

### Product → Order (1:N)
```sql
orders.productId → products.id
ON DELETE: RESTRICT
ON UPDATE: CASCADE
```
A product can have many orders. Deleting a product is restricted if orders exist.

### Collection ↔ Product (N:M via CollectionProduct)
```sql
collection_products.collectionId → collections.id
collection_products.productId → products.id
ON DELETE: RESTRICT
ON UPDATE: CASCADE
```
Many-to-many relationship allowing products to appear in multiple collections.

---

## 🔍 Indexes

### Unique Indexes

```sql
CREATE UNIQUE INDEX "merchants_username_key" ON "merchants"("username");
CREATE UNIQUE INDEX "merchants_email_key" ON "merchants"("email");
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
```

### Performance Indexes (Recommended for Production)

```sql
-- Product filtering and search
CREATE INDEX "idx_products_merchantId" ON "products"("merchantId");
CREATE INDEX "idx_products_category" ON "products"("category");
CREATE INDEX "idx_products_clothingType" ON "products"("clothingType");
CREATE INDEX "idx_products_genderType" ON "products"("genderType");
CREATE INDEX "idx_products_isActive" ON "products"("isActive");
CREATE INDEX "idx_products_price" ON "products"("price");

-- Order queries
CREATE INDEX "idx_orders_merchantId" ON "orders"("merchantId");
CREATE INDEX "idx_orders_status" ON "orders"("status");
CREATE INDEX "idx_orders_createdAt" ON "orders"("createdAt");

-- Collection queries
CREATE INDEX "idx_collections_isFeatured" ON "collections"("isFeatured");

-- Full-text search (PostgreSQL only)
CREATE INDEX "idx_products_search" ON "products"
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

---

## 🎨 Data Types & Constraints

### ID Generation (CUID)
All primary keys use `cuid()` - Collision-resistant Unique Identifiers:
- Example: `cmg0mhild000xw4k8vizp2ox3`
- URL-safe, sortable, 25 characters
- Better than UUID for user-facing applications

### Currency Handling
- **Format**: REAL (float) for amounts
- **Currency**: Always ZAR (South African Rand)
- **Precision**: 2 decimal places (cents)
- **Example**: R1,399.00 stored as `1399.0`

### Boolean Fields
- Stored as INTEGER in SQLite (0 = false, 1 = true)
- Native BOOLEAN in PostgreSQL
- Always have default values

### DateTime Fields
- Stored as ISO 8601 strings in SQLite
- Native TIMESTAMP in PostgreSQL
- All times in UTC
- `createdAt`: Auto-set on insert
- `updatedAt`: Auto-updated on every modification

### Text Length Considerations

| Field Type | Max Length | Notes |
|------------|------------|-------|
| Username | 50 chars | URL-safe, lowercase recommended |
| Display Name | 100 chars | UTF-8 support for SA names |
| Email | 255 chars | Standard email max length |
| Bio | 1000 chars | ~150 words |
| Description | 2000 chars | ~300 words |
| Location | 100 chars | "City, Country" format |

---

## 📦 Current Database State

### Production Data Summary

**Merchants:** 2 active merchants

| Username | Display Name | Location | Followers | Products |
|----------|--------------|----------|-----------|----------|
| tol_thema | Tol'thema | Johannesburg, South Africa | 17,201 | 13 |
| suhu | SUHU | Johannesburg, South Africa | 9,155 | 3 |

**Products:** 16 active products

| Metric | Value |
|--------|-------|
| Total Products | 16 |
| Average Price | R1,265.44 |
| Price Range | R950 - R1,899 |
| Categories | Dresses (62.5%), Tops (31.25%), Pants (6.25%) |
| Gender Distribution | Women (62.5%), Men (31.25%), Unisex (6.25%) |

**Product Samples:**

```
1. The Khosi shirt (R950) - Tops, Men
2. The Zola Kimono - Xhosa Cream White (R950) - Tops, Men
3. Snatched Kimono Mosadi - Sage green shweshwe (R1,400) - Dresses, Women
4. Snatched Kimono Mosadi - Maroon shweshwe (R1,400) - Dresses, Women
5. The Bonang dress (R1,899) - Dresses, Women
```

**Orders:** 0 (prototype phase)
**Collections:** 0 (to be curated)

---

## 🎯 JSON Field Structures

Several fields store JSON-encoded data as TEXT. Here are their structures:

### heroMedia (merchants.heroMedia)

Array of hero media filenames for merchant profile headers.

```json
["hero_1.mp4", "hero_2.jpg", "hero_3.jpg"]
```

**Structure:**
```typescript
type HeroMedia = string[]; // Array of 1-5 filenames
```

**Example:**
```json
["tol_thema_hero_1.mp4", "tol_thema_hero_2.png", "tol_thema_hero_3.png"]
```

### selectedFiles (products.selectedFiles)

Array of product media filenames (images/videos).

```json
["product_image_1.png", "product_image_2.png", "product_video_1.mp4"]
```

**Structure:**
```typescript
type SelectedFiles = string[]; // Array of 1-10 filenames
```

**Example:**
```json
["The Khosi Shirt.png", "The Khosi Shirt 2.png"]
```

### shippingAddress (orders.shippingAddress)

Structured shipping address object.

```json
{
  "fullName": "John Doe",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apartment 4B",
  "city": "Johannesburg",
  "province": "Gauteng",
  "postalCode": "2001",
  "country": "South Africa",
  "phone": "+27123456789"
}
```

**Structure:**
```typescript
interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
}
```

---

## 💡 Best Practices & Guidelines

### Data Integrity

1. **Always use transactions** for operations affecting multiple tables
2. **Validate JSON fields** before insertion (use JSON.parse/stringify)
3. **Check foreign key constraints** before deletions
4. **Use soft deletes** for user-generated content (add `deletedAt` field)

### Query Optimization

1. **Use indexes** for frequently filtered fields (category, genderType, status)
2. **Paginate results** with LIMIT/OFFSET or cursor-based pagination
3. **Eager load relationships** to avoid N+1 query problems
4. **Cache expensive queries** (trending products, featured collections)

### Data Validation

```typescript
// Example validation rules
const ProductValidation = {
  name: { minLength: 3, maxLength: 200 },
  price: { min: 0, max: 1000000 },
  category: { enum: ['Tops', 'Dresses', 'Pants', 'Accessories'] },
  genderType: { enum: ['women', 'men', 'unisex', 'kids'] },
  inventoryType: { enum: ['made_to_order', 'in_stock', 'pre_order'] },
  currency: { fixed: 'ZAR' }
};
```

### Migration Strategy

**SQLite → PostgreSQL Migration Steps:**

1. Export data using Prisma client or CSV
2. Update `schema.prisma` datasource to PostgreSQL
3. Run `prisma migrate dev` to generate PostgreSQL schema
4. Import data with proper transaction handling
5. Rebuild indexes and analyze tables
6. Test all foreign key constraints
7. Verify JSON field parsing

### Backup Recommendations

- **Development**: Daily SQLite file backups
- **Production**: PostgreSQL point-in-time recovery (PITR)
- **Frequency**: Hourly incremental, daily full backups
- **Retention**: 30 days minimum
- **Testing**: Regular restore drills

---

## 🔐 Security Considerations

### Sensitive Data

**Do NOT store in database:**
- Payment card details (PCI-DSS compliance)
- Raw passwords (use bcrypt hashing)
- API keys or secrets
- OAuth tokens (use secure token storage)

**Protect in application layer:**
- Customer personal information (POPIA/GDPR compliance)
- Order details (limit access to merchant/customer only)
- Email addresses (prevent enumeration attacks)

### Query Safety

```typescript
// ❌ BAD: SQL injection vulnerable
const query = `SELECT * FROM products WHERE name = '${userInput}'`;

// ✅ GOOD: Use Prisma's parameterized queries
const products = await prisma.product.findMany({
  where: { name: { contains: userInput } }
});
```

---

## 📚 Additional Resources

### Prisma Documentation
- Schema Reference: https://pris.ly/d/prisma-schema
- Relations: https://pris.ly/d/relations
- Migrations: https://pris.ly/d/migrate

### Database Files
- **Schema:** `prisma/schema.prisma`
- **Database:** `prisma/dev.db`
- **Migrations:** `prisma/migrations/`

### Related Documentation
- **API Documentation:** `docs/` directory
- **Demo Context:** `demo.md`
- **Architecture:** `docs/yiiva-fullstack.md`

---

*This schema document is maintained alongside the Prisma schema file and should be updated whenever database changes are made.*
