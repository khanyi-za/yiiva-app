# Artist Profiles Feature Documentation

## 📖 Overview

Artist profiles are immersive, full-screen experiences that showcase individual creators and their work. They serve as the primary destination for users to learn about artists and browse their portfolios.

## 🎯 Purpose

- **Artist Discovery**: Help users learn about creators and their stories
- **Portfolio Showcase**: Display artist's work in an organized, visual format
- **Social Connection**: Enable following and direct contact with artists
- **Professional Presence**: Give artists a professional platform to present themselves

## ✨ Key Features

### 🖼️ Hero Section
- **Full-screen hero image** extending to device edges (including behind status bar)
- **Artist name overlay** with proper contrast and positioning
- **Profile picture** positioned at bottom of hero with white border
- **Close button** for easy navigation back to previous screen

### 📊 Artist Information
- **Stats display**: Posts, followers, following counts
- **Bio section**: Artist description and story
- **Location**: Geographic location with icon
- **Action buttons**: Follow/Unfollow toggle and Contact button

### 🗂️ Portfolio Organization
- **Category tabs**: Filter work by type (All, Knitwear, Rugs, Paintings, etc.)
- **Masonry grid**: Pinterest-style layout optimizing for different image sizes
- **Product cards**: Title, price, dimensions (where applicable)
- **Interactive products**: Tap to view details (future enhancement)

## 🛠️ Technical Implementation

### File Location
```
app/artist/[artistId].tsx
```

### Route Format
```
/artist/masonwabe-ntloko
/artist/thabo-designs
```

### Key Components Used
- `MasonryGrid` - Flexible grid layout for products
- `SafeAreaInsets` - Proper handling of device safe areas
- `Stack.Screen` - Navigation header configuration
- `Image` (Expo) - Optimized image rendering

### Data Structure
```typescript
interface Artist {
  id: string;
  name: string;
  displayName: string;
  profileImage: any;
  heroImage: any;
  followers: string;
  following: string;
  posts: string;
  bio: string;
  location: string;
  isFollowing: boolean;
  categories: string[];
  products: ArtistProduct[];
}
```

## 🎨 Design Specifications

### Hero Section
- **Height**: Dynamic calculation `(400 * 1.12 * 1.13 * 0.9 * 0.95) + insets.top`
- **Image**: Full width and height coverage
- **Overlay**: Semi-transparent dark overlay for text readability
- **Profile picture**: 80x80px, circular, white border

### Layout Measurements
- **Action buttons**: Full width with 12px gap
- **Stats section**: Equal distribution across width
- **Category tabs**: Horizontal scroll with 12px spacing
- **Product grid**: 2-column masonry with 12px spacing

### Typography
- **Artist name**: 18px, bold, white, letter-spacing: 1
- **Stats numbers**: 20px, bold, black
- **Stats labels**: 14px, gray
- **Bio text**: 16px, dark gray, line-height: 22

## 🔄 User Interactions

### Navigation Entry Points
- **Product cards**: Click artist name or profile image
- **Video cards**: Click artist information
- **Video player**: Click artist name

### Interactive Elements
- **Follow button**: Toggle between "Follow" and "Following" states
- **Contact button**: Placeholder for future messaging feature
- **Category tabs**: Filter portfolio by product type
- **Product cards**: Tap for future product detail view
- **Close button**: Navigate back to previous screen

## 📱 Responsive Behavior

### Safe Area Handling
- Hero image extends behind status bar on all devices
- Close button and artist name positioned with `insets.top + 20`
- Profile picture remains consistently positioned at hero bottom

### Cross-Platform
- **iOS**: Respects notch and home indicator areas
- **Android**: Handles various screen sizes and system UI
- **Status bar**: Light content for visibility over hero image

## 🔮 Future Enhancements

### Phase 2 Features
- **Product detail modals**: Tap products for detailed view
- **Image gallery**: Swipe through multiple product images
- **Direct messaging**: Contact button opens chat interface
- **Share profile**: Social sharing of artist profiles

### Phase 3 Features
- **Artist analytics**: View profile performance metrics
- **Verification badges**: Verified artist indicators
- **Custom categories**: Artists can define their own categories
- **Review system**: Customer reviews and ratings

## 🐛 Known Limitations

- Static mock data (no API integration yet)
- Product cards are not interactive beyond visual feedback
- Contact button is placeholder functionality
- Limited to predefined artist categories

## 📊 Success Metrics

- **Profile views**: Track artist profile visits
- **Follow conversions**: Users who follow after viewing profile
- **Contact requests**: Direct contact attempts
- **Product interactions**: Clicks on portfolio items
- **Category usage**: Which categories are most popular

---

*Related: [Video Experience](./video-player.md) | [Home Feed](./home-feed.md)*