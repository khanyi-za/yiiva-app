# Yiiva Merchant Web Application - Development Documentation

*Last updated: January 15, 2025*

## Project Overview

**Yiiva** is an AI-powered commerce platform specifically designed for South African fashion creators, artists, and brands. This document covers the **merchant web interface** - the dashboard where creators onboard and manage their business operations after joining the platform.

### Key Concept
Transform Instagram accounts into fully functional e-commerce businesses in under 5 minutes through AI-powered product detection and smart onboarding.

---

## Target Market & User Types

### Primary Market: South Africa
- **Currency**: South African Rand (ZAR)
- **Major cities**: Johannesburg, Cape Town, Durban, Pretoria
- **Cultural focus**: South African heritage and contemporary art

### Fashion Merchant Types

#### 1. **Fashion Boutiques** ✨
- **Description**: Curated collections with quality focus
- **Characteristics**:
  - Seasonal inventory management
  - Size ranges (XS-XXL)
  - Higher price points
  - Limited quantities per size
- **Specific Needs**: Size charts, seasonal collections, quality presentation

#### 2. **Fashion Brands** 🏷️
- **Description**: Own clothing lines with brand identity
- **Characteristics**:
  - Multiple product lines
  - Brand consistency and storytelling
  - Size charts and material specifications
  - Pre-orders and limited drops
- **Specific Needs**: Brand storytelling, product line management, size standardization

#### 3. **Clothing Resellers** 🔄
- **Description**: Individual pre-owned pieces
- **Characteristics**:
  - Unique pieces with condition descriptions
  - Authentication needs
  - Original retail price references
  - Quick inventory turnover
- **Specific Needs**: Condition tracking, authentication features, competitive pricing

#### 4. **Thrift Stores** 🕰️
- **Description**: Vintage and second-hand treasures
- **Characteristics**:
  - One-off vintage pieces
  - Era/decade categorization (90s, vintage, etc.)
  - Condition notes and vintage sizing
  - High volume, frequent new arrivals
- **Specific Needs**: Vintage categorization, era dating, volume inventory management

---

## Core Platform Features

### Smart Onboarding (5-minute process)
1. **Business Type Selection** - Choose merchant category
2. **Business Details** - Name, Instagram handle, location
3. **Product Categories** - Select main fashion categories
4. **Instagram Integration** - AI-powered content import

### Administrative Dashboard Functions
- **Inventory Management** - Track stock, handle different business models
- **Order Management** - Process and fulfill customer orders
- **Product Catalog Management** - Edit prices, variants, descriptions
- **Customer Communication** - Handle inquiries and custom requests
- **Analytics** - Performance insights and optimization suggestions
- **Instagram Sync** - Ongoing content import and management

---

## Technical Implementation

### Current Tech Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Development**: Turbopack for fast dev builds

### Project Structure
```
yiiva-merchant-web/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── onboarding/
│   │   │   └── page.tsx               # 4-step onboarding flow
│   │   └── dashboard/
│   │       ├── layout.tsx             # Dashboard shell with sidebar
│   │       ├── page.tsx               # Overview dashboard
│   │       └── products/
│   │           └── page.tsx           # Product management
│   └── docs/                          # Comprehensive documentation
└── package.json
```

---

## Implemented Features (Current Status)

### ✅ Completed

#### 1. Landing Page (`/`)
- Modern gradient design showcasing value proposition
- Four merchant type cards with specific benefits
- South African market focus
- Clear call-to-action to start onboarding

#### 2. Smart Onboarding Flow (`/onboarding`)
- **Step 1**: Business type selection with detailed descriptions
- **Step 2**: Business information (name, Instagram handle, city)
- **Step 3**: Product category selection (3-5 categories recommended)
- **Step 4**: Instagram connection with clear privacy explanation
- Progress indicator showing completion status
- Responsive design for mobile and desktop

#### 3. Dashboard Foundation (`/dashboard`)
- Professional sidebar navigation with 7 main sections
- Overview dashboard with key metrics:
  - Total sales, orders, products, conversion rate
  - Recent orders widget with status tracking
  - Top products performance
- Quick action buttons for common tasks
- South African-specific business tips
- Welcome header with gradient design

#### 4. Products Management (`/dashboard/products`)
- **Fashion-specific features**:
  - Size tracking (S, M, L, XL, numeric sizes)
  - Color variant management
  - Condition notes for thrift/reseller items
  - Instagram source attribution
- **Inventory management**:
  - Made-to-order items
  - Limited stock tracking
  - Unique pieces (one-off items)
- **Advanced filtering**:
  - Category-based filtering
  - Search by product name or tags
  - Sorting by name, price, or status
- **Visual interface**:
  - Product cards with emoji placeholders
  - Status indicators (active, draft, inactive)
  - Inventory type badges
- **Statistics dashboard**:
  - Total products, active products, drafts
  - Instagram import tracking

---

## Instagram Import Implementation Strategy

### Technical Approach (Recommended)

#### **Instagram Basic Display API**
- **Benefits**: Official, secure, compliant with Instagram ToS
- **Access**: Posts, images, captions, hashtags
- **Limitations**: Rate limits (200 requests/hour), requires app review
- **Best for**: MVP and initial implementation

#### **Alternative: Instagram Graph API**
- **Benefits**: Richer data, better for business accounts
- **Requirements**: Business verification, more complex setup
- **Best for**: Advanced features and enterprise clients

### Implementation Architecture
```
Frontend (Next.js) → Backend API → Instagram API → AI Processing → Database
```

### AI Processing Pipeline

#### **Image Analysis** (Computer Vision)
- **Object detection**: Identify clothing items, accessories, jewelry
- **Color extraction**: Dominant colors and color schemes
- **Style analysis**: Vintage, modern, bohemian, streetwear
- **Quality assessment**: Determine if suitable for commerce

#### **Caption Analysis** (Natural Language Processing)
- **Price extraction**: Look for R500, $50, "R1,200" patterns
- **Product identification**: "handmade earrings", "vintage jacket"
- **Material detection**: "100% cotton", "sterling silver"
- **Size information**: "size S-XL available", "30cm x 40cm"
- **Availability clues**: "sold out", "limited edition", "made to order"

### Implementation Phases

#### **Phase 1: Basic Import** (Week 1-2)
- Instagram OAuth integration
- Simple post fetching (images + captions)
- Manual product creation from imported posts
- Basic review UI

#### **Phase 2: AI Enhancement** (Week 3-4)
- Computer vision for object detection
- NLP for caption analysis
- Smart categorization
- Auto-population of product fields

#### **Phase 3: Advanced Features** (Week 5-6)
- Batch import for entire Instagram history
- Duplicate detection and merging
- Ongoing sync for new posts
- Performance optimization

### User Experience Flow

#### **Initial Connection**
1. Simple OAuth - "Connect Instagram" button
2. Clear permission explanation
3. Progress indicator during import
4. AI-analyzed products ready for review

#### **Review & Approve Interface**
```
📸 Found 23 posts from your Instagram

🤖 AI Analysis Complete:
✅ 18 products detected with high confidence
⚠️  5 posts need your review
❌ 0 posts skipped (non-product content)

[Bulk Approve High Confidence] [Review Individual Items]
```

#### **Ongoing Sync**
- Background checks for new posts
- Smart notifications: "3 new posts ready to import"
- One-click import for individual posts

---

## Fashion-Specific Features

### Size Management
- **Standard sizes**: XS, S, M, L, XL, XXL
- **Numeric sizes**: 28, 30, 32 (for jeans)
- **Custom sizing**: Made-to-measure options
- **Size charts**: Upload and display sizing guides

### Color Variant System
- **Primary colors**: As shown in Instagram post
- **Additional colors**: "Also available in..."
- **Custom colors**: "Contact for custom colors"
- **Color families**: Group similar shades

### Inventory Types
- **Made-to-Order**: Always available, lead time specified
- **Limited Stock**: Specific quantities, auto-hide when sold out
- **Unique Pieces**: One-of-a-kind items, remove after sale

### Condition Tracking (for Resellers/Thrift)
- **New with Tags**: Brand new, original tags
- **Excellent**: Gently used, no visible wear
- **Very Good**: Minor wear, fully functional
- **Good**: Visible wear, still in good condition
- **Fair**: Noticeable wear, may have minor flaws

---

## Business Logic & Features

### Smart Template System
Instead of manually entering each product, merchants create templates:

#### **Pricing Templates**
- Category-based pricing (Tops: R200-R400)
- Markup percentages (Cost + 50%, Cost + 100%)
- Quick options: "My items typically range R200-R800"

#### **Size Templates**
- Default size ranges for categories
- Custom sizing availability flags
- Bulk application with individual overrides

#### **Inventory Philosophy**
- Made-to-order with typical creation times
- Limited stock with restock notifications
- Unique pieces with automatic removal

### Progressive Data Enhancement
- **80% complete = ready to sell** philosophy
- **Customer-driven improvements**: Add details based on inquiries
- **Performance-based suggestions**: Enhance popular items
- **Analytics-driven optimization**: Improve based on sales data

---

## South African Market Considerations

### Currency & Pricing
- **Primary currency**: South African Rand (ZAR)
- **Price ranges**: Appropriate for local market
- **Payment integration**: Future support for Paystack, Ozow

### Geographic Features
- **Major cities**: Johannesburg, Cape Town, Durban focus
- **Shipping considerations**: Realistic delivery times
- **Local suppliers**: Integration with SA-based services

### Cultural Elements
- **Heritage collections**: South African traditional wear
- **Local materials**: Highlight SA fabrics and craftsmanship
- **Seasonal awareness**: Southern Hemisphere seasons (Dec-Feb summer)

---

## Future Development Roadmap

### Near Term (Next 2-4 weeks)
1. **Instagram Import Implementation**
   - OAuth integration with Instagram Basic Display API
   - Mock data implementation for testing
   - AI analysis UI and approval flow

2. **Product Management Enhancement**
   - Create/edit product forms
   - Variant management (sizes, colors)
   - Bulk editing capabilities

3. **Order Management System**
   - Order processing workflow
   - Customer communication tools
   - Fulfillment tracking

### Medium Term (1-3 months)
1. **Advanced AI Features**
   - Real computer vision integration
   - NLP for caption analysis
   - Smart pricing suggestions

2. **Analytics Dashboard**
   - Sales performance tracking
   - Customer behavior insights
   - Inventory optimization suggestions

3. **Customer Portal**
   - Public storefront generation
   - Customer account management
   - Review and rating system

### Long Term (3-6 months)
1. **Payment Integration**
   - South African payment gateways
   - International payment options
   - Subscription billing

2. **Advanced Business Features**
   - Multi-channel selling
   - Wholesale management
   - Drop-shipping integration

3. **Platform Expansion**
   - Mobile app companion
   - API for third-party integrations
   - White-label solutions

---

## Development Notes

### Current Dependencies
```json
{
  "react": "19.1.0",
  "react-dom": "19.1.0", 
  "next": "15.4.6",
  "typescript": "^5",
  "tailwindcss": "^4"
}
```

### Required Future Dependencies
```json
{
  "instagram-basic-display-api": "^1.0.0",
  "@google-cloud/vision": "^3.0.0",
  "openai": "^4.0.0", 
  "sharp": "^0.32.0",
  "prisma": "^5.0.0",
  "@supabase/supabase-js": "^2.0.0"
}
```

### Development Server
- **Local**: http://localhost:3000
- **Network**: http://192.168.1.106:3000
- **Build tool**: Turbopack for fast development

---

## Key Design Principles

### User Experience
1. **Simplicity First**: Complex operations made simple
2. **Mobile-Responsive**: Works on all devices
3. **Visual Focus**: Let fashion products shine
4. **Quick Actions**: Common tasks easily accessible

### Business Logic
1. **Progressive Enhancement**: Start basic, improve over time
2. **Template-Driven**: Set once, apply to many
3. **AI-Assisted**: Reduce manual work through automation
4. **Performance-Optimized**: Fast loading, smooth interactions

### South African Focus
1. **Local Market Understanding**: Pricing, preferences, culture
2. **Currency Native**: All prices in ZAR
3. **Geographic Awareness**: Major city focus
4. **Cultural Sensitivity**: Heritage and contemporary balance

---

## Contact & Resources

### Documentation Structure
- **Core docs**: `/src/docs/` folder with comprehensive guides
- **API docs**: Future implementation with backend
- **User guides**: For merchant onboarding and training

### Development Environment
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Development**: Hot reload with Turbopack
- **Deployment**: Ready for Vercel or similar platforms

---

*This document serves as the comprehensive reference for the Yiiva Merchant Web Application development. It should be updated as new features are implemented and requirements evolve.*