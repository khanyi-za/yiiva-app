# Yiiva 3-System Integration Architecture

## 🏗️ System Overview

The Yiiva ecosystem consists of three interconnected applications that create a seamless content-as-catalog commerce experience. This document defines how these systems work individually and together to enable the "Instagram discovery → mobile commerce" journey.

### **Core Philosophy**
*"Content-as-catalog where discovery happens through creators, not categories"*

---

## 📱 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YIIVA ECOSYSTEM                         │
├─────────────────┬───────────────────┬─────────────────────┤
│  MERCHANT WEB   │    NESTJS API     │  CONSUMER MOBILE    │
│     APP         │     BACKEND       │       APP           │
│                 │                   │                     │
│ • Onboarding    │ • Data Sync       │ • Discovery Feed    │
│ • Dashboard     │ • Instagram API   │ • Product Browse    │
│ • Order Mgmt    │ • AI Processing   │ • Purchase Flow     │
│ • Analytics     │ • Order Pipeline  │ • Creator Profiles  │
└─────────────────┴───────────────────┴─────────────────────┘
```

---

## 🖥️ System 1: Merchant Web App (Creator-Facing)

### **Platform & Technology**
- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4  
- **Purpose**: Creator onboarding, dashboard, business management
- **Users**: Artists, designers, craftspeople, brands

### **Core Responsibilities**

#### **1. Creator Onboarding (8-Step Process)**
```
Step 1: Business Type Selection
Step 2: Business Details (name, handle, location)
Step 3: Profile + Product Categories
Step 4: Sample Items + Pricing (training data)
Step 5: AI Analysis of Samples
Step 6: Instagram OAuth Integration
Step 7: Instagram Content AI Analysis
Step 8: Bio Link Generation (yiiva.co/@username)
```

#### **2. Business Dashboard**
- **Order Management**: Real-time order notifications, status tracking
- **Customer Communication**: Messages, queries, support
- **Analytics**: Revenue, order trends, customer insights
- **Inventory**: Stock levels, product performance
- **Profile Management**: Bio, categories, pricing updates

#### **3. Product Catalog Management**
- **Auto-Generated Products**: From Instagram AI analysis
- **Manual Overrides**: Edit AI-generated product details
- **Bulk Operations**: Update pricing, categories, stock status
- **Product Templates**: Reusable pricing and attribute sets

### **Data Flow to Backend**
```javascript
// Onboarding data submission
POST /api/onboarding/complete {
  businessType: "jewelry-designer",
  details: { name, handle, location },
  categories: ["earrings", "necklaces"],
  samples: [{ image, price, description }],
  instagramData: { posts, analysis },
  bioLink: "yiiva.co/@artist_zara"
}

// Order status updates
PUT /api/orders/:orderId/status {
  status: "in_production",
  estimatedCompletion: "2024-02-15",
  customerMessage: "Your earrings are 50% complete!"
}
```

### **Real-Time Features**
- **WebSocket Connection**: `/ws/merchant/:merchantId`
- **Order Notifications**: Instant alerts for new orders
- **Customer Messages**: Real-time chat updates
- **Analytics Updates**: Live dashboard metrics

---

## 🔗 System 2: NestJS API Backend (Data Hub)

### **Platform & Technology**
- **Framework**: Node.js + NestJS + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Purpose**: Centralized data management, API synchronization
- **Integrations**: Instagram Graph API, AI services, payment processing

### **Core Responsibilities**

#### **1. Data Synchronization**
```
Merchant Web App ←→ Backend ←→ Consumer Mobile App
```

**Sync Operations:**
- **Product Catalog**: Merchant updates → Mobile app display
- **Orders**: Customer purchases → Merchant notifications  
- **Messages**: Bidirectional customer-merchant communication
- **Analytics**: Order data → Dashboard insights

#### **2. Instagram Integration**
```javascript
// Instagram OAuth Flow
@Post('auth/instagram')
async connectInstagram(@Body() { code, merchantId }) {
  // Exchange authorization code for access token
  const token = await this.instagramService.exchangeToken(code);
  
  // Fetch user's Instagram posts
  const posts = await this.instagramService.getUserPosts(token);
  
  // Process posts with AI analysis
  const analysis = await this.aiService.analyzeInstagramContent(posts);
  
  // Generate product catalog
  const products = await this.productService.createFromAnalysis(analysis);
  
  return { success: true, productsCreated: products.length };
}
```

#### **3. AI Processing Pipeline**
```javascript
// Step 5: Sample Analysis
@Post('ai/analyze-samples')
async analyzeSamples(@Body() samples) {
  const analysis = await Promise.all(
    samples.map(sample => this.aiService.analyzeProduct(sample))
  );
  
  return {
    templates: this.createPricingTemplates(analysis),
    categories: this.extractCategories(analysis),
    confidence: this.calculateConfidence(analysis)
  };
}

// Step 7: Instagram Content Analysis  
@Post('ai/analyze-instagram')
async analyzeInstagram(@Body() { posts, templates }) {
  const products = await this.aiService.categorizeContent(posts, templates);
  
  return {
    productsGenerated: products.length,
    categorization: this.groupByCategory(products),
    catalogValue: this.calculateValue(products)
  };
}
```

#### **4. Order Management Pipeline**
```javascript
// Order creation from mobile app
@Post('orders/create')
async createOrder(@Body() orderData) {
  const order = await this.orderService.create(orderData);
  
  // Notify merchant via WebSocket
  this.websocketGateway.notifyMerchant(order.merchantId, {
    type: 'NEW_ORDER',
    order: order
  });
  
  // Send customer confirmation
  await this.notificationService.sendOrderConfirmation(order);
  
  return order;
}

// Order status updates from merchant
@Put('orders/:id/status')
async updateOrderStatus(@Param('id') orderId, @Body() update) {
  const order = await this.orderService.updateStatus(orderId, update);
  
  // Notify customer via mobile push notification
  await this.pushService.sendUpdate(order.customerId, {
    title: 'Order Update',
    body: `Your order is now ${update.status}`
  });
  
  return order;
}
```

#### **5. Real-Time Communication**
```javascript
@WebSocketGateway()
export class YiivaGateway {
  // Merchant notifications
  @SubscribeMessage('joinMerchant')
  handleMerchantJoin(client: Socket, merchantId: string) {
    client.join(`merchant_${merchantId}`);
  }
  
  // Customer notifications  
  @SubscribeMessage('joinCustomer')
  handleCustomerJoin(client: Socket, customerId: string) {
    client.join(`customer_${customerId}`);
  }
  
  // Broadcast order updates
  notifyOrderUpdate(orderId: string, update: any) {
    this.server.to(`order_${orderId}`).emit('orderUpdate', update);
  }
}
```

### **API Endpoints Architecture**

#### **Authentication & Users**
```
POST /auth/register              # Merchant registration
POST /auth/login                # Merchant login
POST /auth/instagram-oauth       # Instagram integration
GET  /auth/profile              # User profile data
```

#### **Onboarding Flow**
```
POST /onboarding/business-type   # Step 1: Business type
POST /onboarding/details        # Step 2: Business details  
POST /onboarding/categories     # Step 3: Categories
POST /onboarding/samples        # Step 4: Sample uploads
POST /ai/analyze-samples        # Step 5: AI sample analysis
POST /auth/instagram           # Step 6: Instagram OAuth
POST /ai/analyze-instagram     # Step 7: Instagram AI analysis
POST /onboarding/complete      # Step 8: Finalize setup
```

#### **Product Management**
```
GET  /products                  # Merchant product catalog
POST /products                 # Create new product
PUT  /products/:id             # Update product
DELETE /products/:id           # Remove product
GET  /products/public/:username # Public storefront products
```

#### **Order Pipeline**
```
POST /orders/create            # Customer order creation
GET  /orders/merchant/:id      # Merchant's orders
GET  /orders/:id              # Order details
PUT  /orders/:id/status       # Update order status
POST /orders/:id/message      # Send customer message
GET  /orders/:id/track        # Customer order tracking
```

#### **Analytics & Insights**
```
GET  /analytics/merchant/:id   # Merchant dashboard metrics
GET  /analytics/orders        # Order analytics
GET  /analytics/products      # Product performance
GET  /analytics/customers     # Customer insights
```

---

## 📱 System 3: Consumer Mobile App (Customer-Facing)

### **Platform & Technology**
- **Framework**: React Native + TypeScript (iOS & Android)
- **Purpose**: Content discovery, creator browsing, seamless purchasing
- **Users**: Consumers, art enthusiasts, collectors

### **Core Responsibilities**

#### **1. Content-Driven Discovery**
```
Instagram-Style Feed:
┌─────────────────────────────────┐
│  🔍 Search: "handmade jewelry"  │
├─────────────────────────────────┤
│  📸 [Creator Post/Product]      │
│  @artist_zara                   │
│  💰 R450 • 👁️ 234 views       │
│  ❤️ 45 likes • 💬 12 comments  │
├─────────────────────────────────┤
│  📸 [Creator Post/Product]      │
│  @ceramic_cape                  │
│  💰 R220 • 👁️ 189 views       │
│  ❤️ 67 likes • 💬 8 comments   │
└─────────────────────────────────┘
```

#### **2. Creator Storefront Experience**
```javascript
// Bio link navigation: yiiva.co/@artist_zara
const CreatorStorefront = {
  profile: {
    username: "@artist_zara",
    displayName: "Zara's Handmade Jewelry",
    bio: "African-inspired jewelry • Cape Town",
    followers: 2100,
    following: 450,
    products: 43
  },
  productGrid: [
    // Auto-generated from Instagram analysis
    {
      id: "prod_001",
      title: "Silver Ndebele Hoops",
      price: 450,
      image: "instagram_post_url",
      category: "earrings",
      availability: "made_to_order",
      leadTime: "1-2 weeks"
    }
  ]
}
```

#### **3. Product Discovery Interface**
```
Product Detail View:
┌─────────────────────────────────┐
│  📷 [Product Image Gallery]     │
│  ⬅️ ➡️ Swipe for more photos   │
├─────────────────────────────────┤
│  Silver Ndebele Hoops           │
│  💰 R450                       │
│  👤 by @artist_zara            │
│  📍 Cape Town, South Africa    │
├─────────────────────────────────┤
│  📏 Handmade silver hoops with  │
│     traditional Ndebele beadwork│
│  ⚡ Made to order              │
│  🚚 Ships in 1-2 weeks         │
│  📦 Free shipping over R500    │
├─────────────────────────────────┤
│  [💳 Add to Cart] [💬 Message] │
│  [❤️ Save] [📤 Share]          │
└─────────────────────────────────┘
```

#### **4. Seamless Purchase Flow**
```javascript
// Purchase pipeline
const purchaseFlow = {
  step1: "Add to Cart",
  step2: "Shipping Details",
  step3: "Payment (PayFast/Stripe)",
  step4: "Order Confirmation",
  step5: "Real-time Tracking"
};

// Order creation API call
const createOrder = async (orderData) => {
  const response = await fetch('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify({
      productId: "prod_001",
      customerId: "cust_123",
      merchantId: "merch_456",
      quantity: 1,
      totalAmount: 450,
      shippingAddress: customerAddress,
      paymentMethod: "card"
    })
  });
  
  return response.json();
};
```

#### **5. Real-Time Order Tracking**
```
Order Status Interface:
┌─────────────────────────────────┐
│  Order #YV001                   │
│  Silver Ndebele Hoops           │
│  💰 R450 • Ordered Jan 15      │
├─────────────────────────────────┤
│  Status Timeline:               │
│  ✅ Order Placed               │
│  ✅ Confirmed by Artist        │
│  🔄 In Production (80% done)   │
│  ⏳ Shipping                   │
│  ⏳ Delivered                  │
├─────────────────────────────────┤
│  💬 Message from @artist_zara:  │
│  "Your hoops are almost ready!  │
│   Just adding final touches."   │
│                                 │
│  [💬 Reply] [📞 Call Artist]   │
└─────────────────────────────────┘
```

### **Mobile App Data Flow**
```javascript
// App initialization
const initializeApp = async () => {
  // Load featured creators and products
  const feed = await api.get('/feed/discover');
  
  // Set up real-time notifications
  const socket = io('/customer');
  socket.on('orderUpdate', handleOrderUpdate);
  
  // Initialize push notifications
  await setupPushNotifications();
};

// Deep linking from Instagram bio
const handleDeepLink = (url) => {
  // yiiva.co/@artist_zara
  const username = extractUsername(url);
  navigateToCreatorStorefront(username);
};

// Real-time order updates
const handleOrderUpdate = (update) => {
  updateOrderStatus(update.orderId, update.status);
  showPushNotification(`Order Update: ${update.message}`);
};
```

---

## 🔄 System Integration & Data Flow

### **1. Onboarding Integration Flow**
```
Merchant Web App → Backend → Mobile App Ready

Step 1-4: [Merchant Web] → [Backend] Data Collection
Step 5:   [Backend] → AI Processing → Product Templates
Step 6:   [Merchant Web] → Instagram OAuth → [Backend]
Step 7:   [Backend] → AI Analysis → Product Catalog
Step 8:   [Backend] → Bio Link Active → [Mobile App] Ready
```

### **2. Customer Purchase Flow**
```
Instagram Discovery → Mobile App → Backend → Merchant Web

1. Customer sees Instagram post
2. Clicks bio link: yiiva.co/@username  
3. Deep links to Mobile App storefront
4. Browses products (from Backend API)
5. Makes purchase → Backend processes
6. Merchant receives notification (Web App)
7. Real-time updates to customer (Mobile App)
```

### **3. Order Lifecycle Integration**
```
Mobile App Purchase → Backend → Merchant Web → Mobile App Updates

Customer Order → API → Merchant Notification
Merchant Update → API → Customer Notification  
Status Changes → WebSocket → Real-time Updates
```

### **4. Real-Time Communication**
```javascript
// WebSocket rooms for different user types
const websocketRooms = {
  merchants: `merchant_${merchantId}`,
  customers: `customer_${customerId}`,
  orders: `order_${orderId}`
};

// Cross-system notification flow
const notifyOrderUpdate = async (orderId, update) => {
  // Update database
  await updateOrderInDB(orderId, update);
  
  // Notify merchant web app
  websocket.to(`merchant_${update.merchantId}`).emit('orderUpdate', update);
  
  // Notify customer mobile app  
  websocket.to(`customer_${update.customerId}`).emit('orderUpdate', update);
  
  // Send push notification
  await sendPushNotification(update.customerId, update.message);
};
```

---

## 📊 Data Schema Integration

### **Shared Data Models**

#### **User/Merchant Model**
```typescript
interface Merchant {
  id: string;
  username: string;           // @artist_zara
  businessName: string;       // "Zara's Handmade Jewelry"
  businessType: string;       // "jewelry-designer"
  location: string;           // "Cape Town, South Africa"
  bio: string;
  instagramConnected: boolean;
  instagramToken?: string;
  bioLinkActive: boolean;     // yiiva.co/@username
  onboardingComplete: boolean;
  createdAt: Date;
}
```

#### **Product Model**
```typescript
interface Product {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];           // Instagram post URLs
  instagramPostId?: string;   // Source Instagram post
  availability: 'in_stock' | 'made_to_order' | 'sold_out';
  leadTime?: string;          // "1-2 weeks"
  isActive: boolean;
  aiGenerated: boolean;       // Auto-created vs manual
  createdAt: Date;
}
```

#### **Order Model**
```typescript
interface Order {
  id: string;                 // YV001 format
  customerId: string;
  merchantId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered';
  shippingAddress: Address;
  estimatedDelivery?: Date;
  customerNotes?: string;
  merchantNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Message Model**
```typescript
interface Message {
  id: string;
  orderId?: string;           // Optional: order-related messages
  fromMerchant: boolean;      // true = merchant, false = customer
  fromId: string;             // sender ID
  toId: string;               // recipient ID
  content: string;
  messageType: 'text' | 'image' | 'order_update';
  readAt?: Date;
  createdAt: Date;
}
```

---

## 🔐 Security & Authentication

### **Cross-System Authentication**
```javascript
// JWT token sharing across systems
const authFlow = {
  merchantWeb: {
    login: "JWT token for web app sessions",
    api: "Bearer token for backend calls"
  },
  mobileApp: {
    customer: "Customer JWT for purchases",
    guest: "Anonymous browsing allowed"
  },
  backend: {
    validation: "Validate JWTs from both apps",
    instagram: "OAuth tokens for Instagram API"
  }
};
```

### **API Security**
```typescript
// Rate limiting per system
const rateLimits = {
  merchantWeb: "100 requests/minute",
  mobileApp: "200 requests/minute", 
  instagram: "Instagram API limits",
  ai: "Cost-based limiting"
};

// CORS configuration
const corsConfig = {
  merchantWeb: ["https://merchant.yiiva.co"],
  mobileApp: ["yiiva://app", "https://app.yiiva.co"],
  production: ["https://yiiva.co"]
};
```

---

## 🚀 Deployment & Scaling

### **Environment Configuration**
```
Development:
├── Merchant Web: localhost:3000
├── Mobile App: Expo development build  
├── Backend API: localhost:3001
└── Database: Local PostgreSQL

Staging:
├── Merchant Web: https://merchant-staging.yiiva.co
├── Mobile App: TestFlight/Play Console internal testing
├── Backend API: https://api-staging.yiiva.co  
└── Database: AWS RDS staging instance

Production:
├── Merchant Web: https://merchant.yiiva.co
├── Mobile App: App Store/Play Store release
├── Backend API: https://api.yiiva.co
└── Database: AWS RDS production cluster
```

### **Scaling Considerations**
```typescript
// Auto-scaling triggers
const scalingMetrics = {
  api: {
    cpuThreshold: "70%",
    memoryThreshold: "80%", 
    responseTime: "> 500ms"
  },
  database: {
    connections: "> 80% of max",
    queryTime: "> 1000ms",
    storage: "> 85% full"
  },
  ai: {
    queueLength: "> 100 jobs",
    processingTime: "> 30s per job"
  }
};
```

---

## 📈 Success Metrics & Monitoring

### **Cross-System KPIs**
```javascript
const successMetrics = {
  onboarding: {
    completionRate: "> 90%",      // Merchant Web
    timeToComplete: "< 10 minutes", // End-to-end
    bioLinkActivation: "> 95%"     // Backend processing
  },
  
  customerJourney: {
    instagramToBioLink: "< 5 seconds",    // Link performance
    bioLinkToApp: "< 3 seconds",          // Deep link speed
    browseToOrder: "< 10 minutes",        // Mobile app conversion
    orderCompletion: "> 85%"              // Payment success
  },
  
  merchantOperations: {
    orderNotification: "< 30 seconds",    // Real-time alerts
    responseTime: "< 2 hours average",    // Merchant engagement
    orderFulfillment: "< promised time",  // Delivery performance
    customerSatisfaction: "> 4.5/5"      // Rating system
  }
};
```

### **System Health Monitoring**
```typescript
// Health check endpoints
const healthChecks = {
  merchantWeb: "/health",
  mobileApp: "App crash reporting + analytics",
  backend: "/health/detailed",
  database: "Connection pool + query performance",
  integrations: {
    instagram: "API rate limit monitoring",
    ai: "Processing queue health",
    payments: "Transaction success rates"
  }
};
```

---

## 🎯 Development Priorities

### **Phase 1: MVP Foundation** 
1. **Backend API**: Core endpoints, Instagram OAuth, basic AI simulation
2. **Merchant Web**: 8-step onboarding, basic dashboard  
3. **Mobile App**: Creator storefronts, basic purchase flow

### **Phase 2: Real-Time Features**
1. **WebSocket Integration**: Live notifications across systems
2. **Order Management**: Full lifecycle tracking
3. **Customer Communication**: Messaging system

### **Phase 3: AI & Analytics**
1. **Real AI Integration**: Replace simulation with actual processing
2. **Advanced Analytics**: Performance insights, recommendations
3. **Optimization**: Speed, accuracy, user experience improvements

---

*This document serves as the technical specification for all three Yiiva systems and should be maintained consistently across all project repositories.*