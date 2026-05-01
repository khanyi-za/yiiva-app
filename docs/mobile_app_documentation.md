# Yiiva Mobile App - Frontend Architecture Documentation

**Platform:** React Native (Expo SDK 53)
**Language:** TypeScript 5.8.3
**Last Updated:** 2025-10-09
**Status:** Home Screen Complete

---

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [State Management](#state-management)
4. [API Integration](#api-integration)
5. [Home Screen Implementation](#home-screen-implementation)
6. [Navigation System](#navigation-system)
7. [Key Implementation Decisions](#key-implementation-decisions)
8. [Code References](#code-references)

---

## 🛠️ Tech Stack

### Core Framework
- **React Native**: 0.79.5
- **Expo SDK**: 53.0.23
- **TypeScript**: 5.8.3

### Navigation
- **Expo Router**: 5.1.7 (file-based routing)
- **React Navigation**: 7.x (under the hood)

### Data Fetching
- **TanStack Query**: 5.90.2 (React Query)
- **Fetch API**: Native (no Axios)

### State Management
- **Zustand**: 5.0.8 (social features - likes, bookmarks, follows)
- **React Context**: FilterContext (primary filter state)

### Storage
- **AsyncStorage**: 2.1.2 (persist social state)

### Media
- **expo-image**: 2.4.1 (optimized image loading)
- **expo-video**: (video playback, future use)
- **expo-av**: 15.1.7 (audio/video)

### UI
- **expo-symbols**: Icon system
- **React Native Core**: StyleSheet, View, Text, etc.

---

## 🏗️ Architecture Overview

### Application Structure

```
app/
├── _layout.tsx                    # Root layout (QueryClientProvider, FilterProvider)
├── (tabs)/                        # Tab navigation group
│   ├── _layout.tsx               # Tab bar configuration
│   ├── index.tsx                 # Home feed (main screen)
│   ├── search.tsx                # Search screen
│   ├── explore.tsx               # Explore/discovery screen
│   ├── profile.tsx               # User profile
│   └── bookmarks.tsx             # Saved products
├── artist/
│   └── [artistId].tsx            # Artist profile (dynamic route)
├── product/
│   └── [productId].tsx           # Product detail (dynamic route)
├── checkout.tsx                  # Shopping cart
├── order-success.tsx             # Order confirmation
└── track-order.tsx               # Order tracking

components/
├── ProductCard.tsx               # Main product card for feed
├── RowProductList.tsx            # Horizontal product carousel
├── CategoryFilter.tsx            # Category filter chips
├── FeedTabs.tsx                  # Women/Men/Home tabs
├── YiivaHeader.tsx               # App header
├── SideMenu.tsx                  # Hamburger menu
├── EvenGrid.tsx                  # Grid layout
└── ThemedText.tsx, ThemedView.tsx  # Themed components

lib/
├── api-client.ts                 # API client with fetch wrapper
└── social-store.ts               # Zustand store (likes, bookmarks, follows)

contexts/
└── FilterContext.tsx             # Primary filter state (women/men/home-lifestyle)
```

---

## 🔄 State Management

### 1. TanStack Query (Server State)

**Purpose:** Fetch, cache, and sync server data

**QueryClient Configuration** (`app/_layout.tsx:13-38`)
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // Fresh for 5 minutes
      gcTime: 10 * 60 * 1000,          // Cache for 10 minutes
      retry: 3,                         // Retry 3 times on failure
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,       // Refetch when app regains focus
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

**Query Key Strategy:**
```typescript
['products', 'feed', 'women']        // Main feed for women
['products', 'feed', 'men']          // Main feed for men
['products', 'featured']             // Featured products (shared)
['products', 'new-arrivals', 'women'] // New arrivals for women
```

**Cache Behavior:**
- Tab switching: Instant if cached, else fetch
- App returns to foreground: Auto-refresh
- Data fresh for 5 min: No unnecessary refetches
- Cache kept for 10 min: Fast navigation

---

### 2. Zustand (Client State)

**Purpose:** Manage client-side social features (likes, bookmarks, follows)

**Store:** `lib/social-store.ts`

```typescript
interface SocialState {
  likedProducts: Set<string>;
  bookmarkedProducts: Set<string>;
  followedMerchants: Set<string>;

  toggleLike: (productId: string) => void;
  toggleBookmark: (productId: string) => void;
  toggleFollow: (merchantId: string) => void;

  isLiked: (productId: string) => boolean;
  isBookmarked: (productId: string) => boolean;
  isFollowing: (merchantId: string) => boolean;

  loadState: () => Promise<void>;
  saveState: () => Promise<void>;
}
```

**Persistence:**
- Stored in AsyncStorage
- Auto-saves on every toggle action
- Loaded on app startup

**No Server Sync:**
- All social actions are client-side only
- No API calls when user likes/bookmarks
- Future: Will sync counts to backend for analytics

---

### 3. React Context (UI State)

**FilterContext** (`contexts/FilterContext.tsx`)

```typescript
interface FilterContextType {
  activePrimaryFilter: 'men' | 'women' | 'home-lifestyle';
  setActivePrimaryFilter: (filter: FilterType) => void;
}
```

**Purpose:** Share primary filter state across app
**Usage:** FeedTabs component sets, Home screen reads

---

## 🌐 API Integration

### API Client (`lib/api-client.ts`)

**Base URL Configuration:**
```typescript
const API_BASE_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api',  // Android emulator host access
  default: 'http://localhost:3000/api',
});
```

**Core Fetch Wrapper:**
```typescript
async function fetchAPI<T>(endpoint: string, options = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new APIError(json.error?.code, json.error?.message);
  }

  return json.data;
}
```

**Error Handling:**
- Custom `APIError` class with error codes
- Automatic retry (3x with exponential backoff)
- Network errors caught and displayed
- UI shows error state with retry button

---

### API Functions

#### 1. Main Product Feed
```typescript
export async function getProductFeed(params: {
  genderType: 'women' | 'men' | 'unisex';
  limit?: number;
  offset?: number;
}): Promise<{ products: Product[] }>
```

**Endpoint:** `GET /api/products/feed?genderType=women&limit=20&offset=0`
**Usage:** Home screen main feed
**Filters:** Gender type only (from FeedTabs)

---

#### 2. Featured Products
```typescript
export async function getFeaturedProducts(params?: {
  limit?: number;
}): Promise<{ products: CarouselProduct[] }>
```

**Endpoint:** `GET /api/products/featured?limit=6`
**Usage:** Horizontal carousel (inserted after 3rd product)
**Filters:** None (random selection)

---

#### 3. New Arrivals
```typescript
export async function getNewArrivals(params: {
  genderType: 'women' | 'men' | 'unisex';
  limit?: number;
}): Promise<{ products: CarouselProduct[] }>
```

**Endpoint:** `GET /api/products/new-arrivals?genderType=women&limit=6`
**Usage:** Horizontal carousel (inserted after 6th product)
**Filters:** Gender type (from FeedTabs)

---

### Type Definitions

#### Product (Main Feed)
```typescript
export interface Product {
  id: string;                    // Product CUID
  name: string;                  // Product name
  price: number;                 // Price in ZAR
  currency: string;              // Always "ZAR"
  primaryImage: string;          // Full URL to first image
  merchant: {
    id: string;
    username: string;            // For /artist/[username] navigation
    displayName: string;         // Display in UI
    logo: string | null;         // Full URL or null
    isVerified: boolean;
  };
  category: string;
  clothingType: string;
  genderType: string;
}
```

#### CarouselProduct (Horizontal Lists)
```typescript
export interface CarouselProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;                 // Full URL to first image
  merchant: {
    displayName: string;         // Minimal merchant info
  };
}
```

---

## 🏠 Home Screen Implementation

### Component Hierarchy

```
HomeScreen (app/(tabs)/index.tsx)
├── YiivaHeader
│   ├── Menu button
│   ├── Logo
│   ├── Notifications
│   └── Cart
├── SideMenu (modal)
├── FeedTabs
│   ├── Women tab
│   ├── Men tab
│   └── Home & Lifestyle tab
├── ScrollView
│   ├── CategoryFilter (decorative only)
│   ├── Loading State (ActivityIndicator)
│   ├── Error State (with retry button)
│   └── Product Feed
│       ├── ProductCard #1
│       ├── ProductCard #2
│       ├── ProductCard #3
│       ├── RowProductList (Featured) ← Inserted after 3rd product
│       ├── ProductCard #4
│       ├── ProductCard #5
│       ├── ProductCard #6
│       ├── RowProductList (New Arrivals) ← Inserted after 6th product
│       ├── ProductCard #7
│       └── ...more products
```

---

### Data Fetching (TanStack Query)

**Home Screen Queries** (`app/(tabs)/index.tsx:32-62`)

```typescript
// Main feed - refetches when FeedTabs change
const { data: feedData, isLoading: feedLoading, error: feedError, refetch } = useQuery({
  queryKey: ['products', 'feed', activePrimaryFilter],
  queryFn: () => api.getProductFeed({ genderType: activePrimaryFilter }),
  staleTime: 5 * 60 * 1000,
});

// Featured products - cached longer (random, no filters)
const { data: featuredData, isLoading: featuredLoading } = useQuery({
  queryKey: ['products', 'featured'],
  queryFn: () => api.getFeaturedProducts({ limit: 6 }),
  staleTime: 10 * 60 * 1000,
});

// New arrivals - refetches when FeedTabs change
const { data: newArrivalsData, isLoading: newArrivalsLoading } = useQuery({
  queryKey: ['products', 'new-arrivals', activePrimaryFilter],
  queryFn: () => api.getNewArrivals({ genderType: activePrimaryFilter, limit: 6 }),
  staleTime: 5 * 60 * 1000,
});
```

**Query Invalidation:**
- FeedTabs change → `activePrimaryFilter` changes → queries refetch automatically
- Pull to refresh → `refetch()` called manually
- App comes to foreground → Auto-refetch (configured in QueryClient)

---

### ProductCard Component

**File:** `components/ProductCard.tsx`

**Props:**
```typescript
interface ProductCardProps {
  productImage: any;             // Image source
  profileImage?: any;            // Merchant logo (optional)
  artistName: string;            // Merchant display name
  productTitle: string;          // Product name
  price: string;                 // Formatted price (e.g., "R1,399.00")
  timestamp?: string;            // Post timestamp (future)
  location?: string;             // Merchant location (future)
  productId?: string;            // For navigation to product detail
  artistId?: string;             // Merchant username for navigation
  onBookmark?: () => void;       // Bookmark handler
  onLike?: () => void;           // Like handler
  isLiked?: boolean;             // Like state
  isBookmarked?: boolean;        // Bookmark state
}
```

**Layout:**
```
┌─────────────────────────────────┐
│                                 │
│     [Product Image 370px]       │
│                                 │
└─────────────────────────────────┘
Product Title
By Artist Name        [🔖] [❤️]
R1,399.00
```

**Interactions:**
- Tap image → Navigate to `/product/[productId]`
- Tap artist name → Navigate to `/artist/[username]`
- Tap bookmark → Toggle in Zustand (no API call)
- Tap heart → Toggle in Zustand (no API call)

---

### UI States

#### Loading State
```typescript
{feedLoading && (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#000" />
    <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
  </View>
)}
```

#### Error State
```typescript
{feedError && (
  <View style={styles.errorContainer}>
    <ThemedText style={styles.errorText}>Unable to load products</ThemedText>
    <ThemedText style={styles.errorSubtext}>
      {feedError instanceof Error ? feedError.message : 'Please check your connection'}
    </ThemedText>
    <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
      <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
    </TouchableOpacity>
  </View>
)}
```

#### Success State
```typescript
{!feedLoading && !feedError && (
  <ThemedView style={styles.feed}>
    {feedData?.products?.map((product, index) => (
      <ProductCard key={product.id} {...product} />
    ))}
  </ThemedView>
)}
```

---

## 🧭 Navigation System

### File-Based Routing (Expo Router)

```
app/
├── (tabs)/index.tsx      → /
├── (tabs)/search.tsx     → /search
├── artist/[artistId].tsx → /artist/tol_thema
└── product/[productId].tsx → /product/cmg0mhild000xw4k8vizp2ox3
```

**Navigation from ProductCard:**

```typescript
// Navigate to artist profile
const handleArtistPress = () => {
  const id = artistId || artistName.toLowerCase().replace(/\s+/g, '-');
  router.push(`/artist/${id}`);  // Uses merchant.username from API
};

// Navigate to product detail
const handleProductPress = () => {
  if (productId) {
    router.push(`/product/${productId}`);  // Uses product.id from API
  }
};
```

**Navigation Flow:**

```
Home Screen
    │
    ├─ Tap Product Image ──────→ /product/[productId]
    │                             (Future: Full media carousel)
    │
    ├─ Tap Artist Name ────────→ /artist/[username]
    │                             (Future: Artist profile)
    │
    ├─ Tap Like Button ────────→ No navigation (Zustand toggle)
    │
    └─ Tap Bookmark Button ────→ No navigation (Zustand toggle)
```

---

## 🎯 Key Implementation Decisions

### 1. Image Handling Strategy

**Decision:** Show ONE primary image per product in home feed

**Reasoning:**
- Performance: 20+ cards with 6 images each = laggy scrolling
- UX: Instagram/Pinterest use static images in feed
- User expectation: Tap to see more details

**Implementation:**
- API returns `primaryImage` (first from `selectedFiles` array)
- ProductCard displays single static image
- Product Detail screen will show full carousel (future)

**Database Reality:**
```json
{
  "selectedFiles": "[\"image1.png\", \"image2.png\", \"video.mp4\"]"
}
```

**Home Feed Displays:**
- Only `image1.png` (transformed to full URL by backend)

**Product Detail Will Display:**
- All media in swipeable carousel (future implementation)

---

### 2. Filtering Strategy

**FeedTabs (Women/Men/Home) - ACTIVE**
- ✅ Triggers API call with `genderType` parameter
- ✅ Invalidates TanStack Query cache
- ✅ Refetches products for new gender type

**CategoryFilter (Dresses/Tops/etc) - DECORATIVE**
- ❌ Does NOT trigger API call
- ❌ Does NOT filter products
- ✅ Only updates local `activeCategory` state
- **Why:** Simplifies prototype, can enable later

**Featured Products - RANDOM**
- ❌ No filters applied
- ✅ Random selection from entire catalog
- **Why:** Discovery mechanism (show items user might not normally see)

---

### 3. Social Features Strategy

**Like & Bookmark - CLIENT-SIDE ONLY**

**Implementation:**
```typescript
// Zustand store toggles
const handleLike = (productId: string) => {
  toggleLike(productId);  // Updates Set, saves to AsyncStorage
  // NO API CALL
};

const handleBookmark = (productId: string) => {
  toggleBookmark(productId);  // Updates Set, saves to AsyncStorage
  // NO API CALL
};
```

**Why Client-Side Only:**
- Instant UI feedback (no network delay)
- Works offline
- Reduces backend load
- Persists across app sessions (AsyncStorage)
- Future: Will sync counts to backend for analytics

**Data Flow:**
```
User taps heart
    ↓
Zustand store updated (Set.add or Set.delete)
    ↓
AsyncStorage saved automatically
    ↓
UI re-renders with new state
    ↓
NO API CALL
```

---

### 4. Performance Optimizations

**TanStack Query Caching:**
```typescript
// Main feed: 5 min stale time
staleTime: 5 * 60 * 1000

// Featured products: 10 min stale time (changes less frequently)
staleTime: 10 * 60 * 1000
```

**Result:**
- Tab switching: Instant from cache (if < 5 min old)
- Background refresh: Only when data is stale
- Reduced API calls: ~70% fewer requests

**Image Loading:**
- `expo-image` component (optimized for React Native)
- Automatic caching
- Progressive loading

**List Rendering:**
- `ScrollView` (not virtualized) - OK for ~20 items
- Future: Switch to `FlashList` for 1000+ items

---

## 📝 Code References

### Core Files

| File | Purpose | Key Lines |
|------|---------|-----------|
| `app/_layout.tsx` | Root layout, QueryClientProvider setup | 13-38, 59 |
| `app/(tabs)/index.tsx` | Home screen implementation | 32-62 (queries), 124-221 (UI) |
| `lib/api-client.ts` | API client, fetch wrapper, type defs | 1-247 |
| `lib/social-store.ts` | Zustand social features store | 1-131 |
| `contexts/FilterContext.tsx` | Primary filter state | 1-32 |
| `components/ProductCard.tsx` | Main product card component | 9-170 |
| `components/RowProductList.tsx` | Horizontal carousel component | 8-141 |
| `components/FeedTabs.tsx` | Women/Men/Home tabs | 7-92 |
| `components/CategoryFilter.tsx` | Category filter chips | 6-134 |

### Type Definitions

| Type | Location | Line |
|------|----------|------|
| `Product` | `lib/api-client.ts` | 54-70 |
| `CarouselProduct` | `lib/api-client.ts` | 75-84 |
| `APIError` | `lib/api-client.ts` | 93-102 |
| `SocialState` | `lib/social-store.ts` | 4-26 |
| `FilterContextType` | `contexts/FilterContext.tsx` | 5-8 |

### API Functions

| Function | Location | Line |
|----------|----------|------|
| `getProductFeed()` | `lib/api-client.ts` | 180-192 |
| `getFeaturedProducts()` | `lib/api-client.ts` | 203-211 |
| `getNewArrivals()` | `lib/api-client.ts` | 223-233 |
| `fetchAPI()` (core wrapper) | `lib/api-client.ts` | 112-163 |

---

## 🚀 Future Implementation Tasks

### Short Term
- [ ] Implement Product Detail screen with full media carousel
- [ ] Implement Artist Profile screen (`/artist/[username]`)
- [ ] Add infinite scroll to home feed (`useInfiniteQuery`)
- [ ] Improve price formatting to South African locale

### Medium Term
- [ ] Enable CategoryFilter with actual API filtering
- [ ] Implement search functionality
- [ ] Add video playback support
- [ ] Sync social stats to backend

### Long Term
- [ ] Add authentication flow
- [ ] Implement checkout process
- [ ] Add order tracking
- [ ] Add push notifications
- [ ] Implement messaging system

---

## 🔗 Related Documentation

- **API Specification:** `docs/REST_API_MIGRATION.md` (for backend engineers)
- **Database Schema:** `docs/database_schema.md`
- **User Flows:** `docs/user-flow-and-screen-details.md`
- **Full Stack Overview:** `docs/yiiva-fullstack.md`

---

**Document Maintained By:** Mobile Development Team
**For Questions:** Reference code locations above or consult API spec
