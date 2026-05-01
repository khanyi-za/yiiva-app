# Yiiva Mobile App - User Flow & Screen Details

## 📱 App Navigation Structure

```
Root Layout
├── Tab Navigation (Main App)
│   ├── Home Feed (index.tsx)
│   ├── Search (search.tsx)
│   ├── Explore (explore.tsx)
│   └── Profile (profile.tsx)
├── Artist Profile ([artistId].tsx)
├── Product Detail ([productId].tsx)
├── Video Player (video-player.tsx)
└── 404 Not Found (+not-found.tsx)
```

## 🏠 Primary User Flows

### Flow 1: Product Discovery & Purchase
```
Home Feed → Product Card → Product Detail → Add to Cart/Buy Now
          ↳ Artist Profile → Product Grid → Product Detail
```

### Flow 2: Artist Discovery & Following
```
Explore → Trending Artists → Artist Profile → Follow/Contact
        ↳ Featured Collections → Collection View → Artist Profile
```

### Flow 3: Content Search & Filtering
```
Search → Enter Query → Filtered Results → Product/Artist Selection
       ↳ Recent Searches → Quick Access
       ↳ Trending Hashtags → Discover Content
```

### Flow 4: Video Content Engagement
```
Explore → Video Cards → Video Player → Like/Share/Comment
        ↳ TikTok-style infinite scroll
        ↳ Artist Profile Navigation
```

---

## 🖼️ Detailed Screen Specifications

### 1. Home Feed Screen (`/app/(tabs)/index.tsx`)

**Purpose**: Instagram-style product discovery feed
**Components**:
- `YiivaHeader` - App logo, menu, cart icons
- `FeedTabs` - "For You" / "Following" toggle
- `CategoryFilter` - Horizontal scrolling filter chips
- `ProductCard` (Multiple) - Individual product showcases

**User Interactions**:
- Scroll vertically through product feed
- Switch between "For You" and "Following" tabs
- Filter by categories (All, Fashion, Art, Home, etc.)
- Like, bookmark, and share products
- Navigate to product details or artist profiles

**Data Displayed**:
- Artist profile pictures and names
- Product images with pricing in South African Rand
- Location tags (Johannesburg, Cape Town, Durban)
- Time stamps (1 day, 3 days, 1 week)
- Social engagement buttons

**Mock Data**: Features real South African brands like Tol-thema, Masonwabe Ntloko

---

### 2. Search Screen (`/app/(tabs)/search.tsx`)

**Purpose**: Advanced search and discovery interface
**States**:
1. **Default State**: Masonry grid of trending products
2. **Search Focused**: Recent searches + trending hashtags
3. **Search Results**: Filtered product cards

**Components**:
- Search input with magnifying glass icon
- `CategoryFilter` - Optional category filtering
- `MasonryGrid` - Pinterest-style product layout
- `ProductCard` - Search result items

**User Interactions**:
- Type in search bar to filter products/artists/locations
- Clear search with X button
- Tap recent searches for quick access
- Select trending hashtags (#HandmadeArt, #LocalArtists, etc.)
- Filter results by category

**Search Functionality**:
- Real-time filtering as user types
- Searches across: product titles, artist names, locations
- Result count display
- No results state with helpful messaging

---

### 3. Explore Screen (`/app/(tabs)/explore.tsx`)

**Purpose**: Curated discovery and trending content
**Sections**:
1. **Featured Collections** (Horizontal scroll)
2. **Trending Artists** (Horizontal scroll)  
3. **Category Filter**
4. **Curated Videos** (Vertical list)

**Components**:
- `YiivaHeader` - Navigation and cart
- Collection cards with overlay text and item counts
- Artist cards with follow/following buttons
- `VideoCard` - Video thumbnails with play functionality
- `CategoryFilter` - Content filtering

**User Interactions**:
- Browse featured collections (South African Heritage, Urban Street Style)
- Follow/unfollow trending artists
- Watch curated video content
- Navigate to artist profiles
- Play videos in full-screen player

**Social Features**:
- Artist follower counts (12.4K, 8.9K, 15.2K)
- Follow/following state management
- Video likes and engagement metrics

---

### 4. Profile Screen (`/app/(tabs)/profile.tsx`)

**Current State**: Placeholder implementation
**Purpose**: User profile and account management
**Status**: Ready for implementation

**Planned Features**:
- User profile picture and bio
- Personal product collections
- Purchase history
- Account settings
- Saved items and wishlist

---

### 5. Artist Profile Screen (`/app/artist/[artistId].tsx`)

**Purpose**: Immersive artist showcase and portfolio
**Layout**:
1. **Hero Media Carousel** - Full-screen images/videos
2. **Profile Actions** - Follow/Contact buttons
3. **Artist Stats** - Posts, Followers, Following counts
4. **Bio Section** - Description and location
5. **Category Tabs** - Product filtering
6. **Product Grid** - Masonry layout portfolio

**Components**:
- Hero carousel with dot indicators
- Video player with mute controls
- `MasonryGrid` for product display
- Action buttons with haptic feedback

**User Interactions**:
- Swipe through hero media (images + videos)
- Follow/unfollow artists
- Contact artist directly
- Filter products by category (All, Knitwear, Rugs, Paintings)
- Navigate to individual products

**Example Artists**:
- **Masonwabe Ntloko**: Traditional craft + modern art (12.4K followers)
- **Tol-thema**: Gracious elegance, Mosadi collection (14.3K followers)

**Media Support**:
- High-resolution images
- Auto-playing videos with mute controls
- Smooth carousel navigation
- Professional overlay effects

---

### 6. Product Detail Screen (`/app/product/[productId].tsx`)

**Purpose**: Detailed product view and purchase interface
**Layout**:
1. **Hero Media Carousel** - Product images/videos
2. **Action Buttons** - Save and share
3. **Product Information** - Title, price, category
4. **Variant Selection** - Colors and sizes
5. **Description** - Detailed product information
6. **Fixed Purchase Section** - Add to cart / Buy now

**Components**:
- Media carousel with video support
- Color picker with visual swatches
- Size selector with multiple options
- Fixed bottom purchase buttons

**User Interactions**:
- Swipe through product media
- Select color variants (Beige, Black, Navy, White)
- Choose sizes (XS, S, M, L, XL)
- Save to favorites
- Share products
- Add to cart or buy immediately

**E-commerce Features**:
- Visual color selection with swatches
- Size options with clear selection states
- Detailed product descriptions
- Purchase flow integration points

---

### 7. Video Player Screen (`/app/video-player.tsx`)

**Purpose**: TikTok/Instagram Reels-style video experience
**Layout**: Full-screen vertical video player
**Features**:
1. **Infinite Scroll** - Vertical swipe between videos
2. **Side Actions** - Like, comment, share, follow
3. **Artist Integration** - Profile access from videos
4. **Social Engagement** - Real-time interaction metrics

**Components**:
- Full-screen video container
- Side action buttons panel
- Bottom artist/content info overlay
- Artist profile quick access

**User Interactions**:
- Swipe up/down to navigate videos
- Double-tap to like
- Tap artist profile to view full profile
- Like, comment, share videos
- Follow artists directly from videos

**Video Content**:
- Behind-the-scenes creative processes
- Artist spotlights and interviews
- Product creation demonstrations
- Cultural and heritage storytelling

**Social Features**:
- Like counts (8.9K, 12.4K, 15.2K)
- Comment and share metrics
- Follow/following states
- Artist profile integration

---

## 🔄 Navigation Patterns

### Tab Navigation
- **Home** (house.fill): Main product feed
- **Search** (magnifyingglass): Search and discovery
- **Explore** (safari): Curated content and trending
- **Profile** (person.fill): User account

### Deep Linking
- `/artist/[artistId]` - Direct artist profile access
- `/product/[productId]` - Direct product detail access
- `/video-player?videoId=[id]` - Direct video access

### Back Navigation
- Hardware back button support
- In-app back buttons on detail screens
- Breadcrumb navigation for deep flows

---

## 🎨 UI/UX Design Principles

### Visual Hierarchy
- **Headers**: Bold, prominent artist and product names
- **Pricing**: Large, clear South African Rand display
- **Metadata**: Subtle timestamps and locations
- **Actions**: Consistent button styling across screens

### Interaction Patterns
- **Haptic Feedback**: Tab navigation with tactile response
- **Pull-to-Refresh**: Feed content updates
- **Infinite Scroll**: Seamless content loading
- **Gesture Navigation**: Swipe patterns for media carousels

### Accessibility
- High contrast text and backgrounds
- Clear button targets with adequate touch zones
- Screen reader support through semantic markup
- Alternative text for images and videos

---

## 📊 Content Types & Data

### Product Data
- High-resolution product photography
- Video demonstrations and showcases
- Pricing in South African Rand (R1,150 - R5,200)
- Category classification (Dresses, Rugs, Paintings, Knitwear)
- Variant options (colors, sizes, dimensions)

### Artist Data
- Professional profile photography
- Hero media (images and videos)
- Social metrics (followers, following, posts)
- Geographic location within South Africa
- Bio and artistic statements
- Product portfolios with categorization

### Video Content
- Portrait orientation for mobile viewing
- Creative process documentation
- Artist interviews and spotlights
- Product creation behind-the-scenes
- Cultural heritage storytelling

---

## 🔗 Integration Points

### Social Features
- Follow/unfollow artists
- Like and bookmark products
- Share content across platforms
- Comment and engagement systems

### E-commerce Integration
- Add to cart functionality
- Buy now purchase flow
- Variant selection (color, size)
- Price display in local currency
- Inventory and availability status

### Content Management
- Dynamic product feeds
- Curated collections
- Trending algorithm integration
- Real-time social metrics
- Content categorization and filtering

---

## 🎯 User Journey Examples

### New User Discovery Journey
1. **Entry**: Opens app, sees Home feed
2. **Discovery**: Scrolls through For You products
3. **Interest**: Taps on Tol-thema product card
4. **Detail**: Views Plain Lindy dress details
5. **Artist**: Navigates to Tol-thema profile
6. **Follow**: Follows artist, browses portfolio
7. **Purchase**: Returns to product, selects size/color, buys

### Returning User Engagement
1. **Entry**: Opens to Following tab
2. **Content**: Sees updates from followed artists
3. **Video**: Watches new artist showcase video
4. **Explore**: Switches to Explore for trending content
5. **Search**: Uses search to find specific item type
6. **Purchase**: Completes purchase of discovered item

### Artist Content Consumer
1. **Video Entry**: Accesses video player from Explore
2. **Binge Watch**: Swipes through multiple artist videos
3. **Profile Visit**: Taps artist name to view full profile
4. **Portfolio Browse**: Explores artist's complete collection
5. **Contact**: Initiates contact for custom commission
6. **Social Sharing**: Shares favorite pieces with friends

This comprehensive user flow showcases Yiiva as a sophisticated social commerce platform that successfully bridges the gap between traditional South African artistry and modern mobile commerce experiences.