import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/ThemedText';
import { api } from '@/lib/api-client';
import { getLocalAsset } from '@/lib/local-assets';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useCartStore } from '@/lib/cart-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

/**
 * Media Item Component - Handles both images and videos using LOCAL ASSETS
 * API returns URLs, but we load from bundled assets in /assets/media/
 */
function MediaItem({
  media,
  index,
  isActive
}: {
  media: any;
  index: number;
  isActive: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const localAsset = getLocalAsset(media.url);

  // Create video player
  const player = useVideoPlayer(
    media.type === 'video' && localAsset ? localAsset : '',
    (player) => {
      player.loop = true;
      player.muted = false;
    }
  );

  // Control playback based on active state and user interaction
  useEffect(() => {
    if (media.type === 'video' && player) {
      if (isActive && isPlaying) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isActive, isPlaying, player, media.type]);

  // Auto-play when this media becomes active
  useEffect(() => {
    if (media.type === 'video' && isActive) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isActive, media.type]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (media.type === 'image') {
    if (!localAsset) {
      return (
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoText}>Image not found</Text>
        </View>
      );
    }

    return (
      <Image
        source={localAsset}
        style={styles.heroImage}
        contentFit="cover"
        onError={(e) => console.log('Image load error:', media.url, e.error)}
        onLoad={() => console.log('Image loaded from local assets:', media.url)}
      />
    );
  }

  if (media.type === 'video') {
    if (!localAsset) {
      return (
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoText}>Video not found</Text>
        </View>
      );
    }

    return (
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.heroImage}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
        />

        {/* Elegant Play/Pause Button */}
        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={togglePlayPause}
          activeOpacity={0.8}
        >
          <View style={styles.playPauseIconContainer}>
            <IconSymbol
              name={isPlaying ? 'pause.fill' : 'play.fill'}
              size={32}
              color="#fff"
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.videoPlaceholder}>
      <Text style={styles.videoText}>Media not available</Text>
    </View>
  );
}

/**
 * Product Detail Screen
 * Based on Yiiva design specifications
 */
export default function ProductScreen() {
  const params = useLocalSearchParams();
  const productId = params.productId as string;
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const { addToCart } = useCartStore();
  const insets = useSafeAreaInsets();

  // Fetch product details
  const { data: productData, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.getProductById(productId),
  });

  // Fetch similar products
  const { data: similarData } = useQuery({
    queryKey: ['similar-products', productId],
    queryFn: () => api.getSimilarProducts({ productId, limit: 6 }),
  });

  if (productLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  if (productError || !productData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            {productError instanceof Error ? productError.message : 'Product not found'}
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const product = productData.product;
  const sizes = product.size ? product.size.split(',').map(s => s.trim()) : [];

  // Handler for adding product to cart
  const handleAddToCart = () => {
    // Check if size is required and selected
    if (sizes.length > 0 && !selectedSize) {
      alert('Please select a size before adding to cart');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency || 'R',
      image: product.primaryImage || (product.media[0]?.url || ''),
      merchant: {
        id: product.merchant.id,
        username: product.merchant.username,
        displayName: product.merchant.displayName,
      },
      selectedSize: selectedSize || undefined,
    });

    // Show success message
    alert(`${product.name} has been added to your cart!`);
  };

  // Debug logging
  console.log('Product ID:', productId);
  console.log('Product media count:', product.media.length);
  console.log('Product media:', JSON.stringify(product.media, null, 2));
  if (similarData) {
    console.log('Similar products count:', similarData.products.length);
    console.log('First similar product:', JSON.stringify(similarData.products[0], null, 2));
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Media Carousel */}
        <View style={[styles.heroSection, { height: width * 1.3 + insets.top }]}>
          <TouchableOpacity style={[styles.backIcon, { top: insets.top + 16 }]} onPress={() => router.back()}>
            <Text style={styles.backIconText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.shareIcon, { top: insets.top + 16 }]}>
            <Text style={styles.shareIconText}>↗</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cartIcon, { top: insets.top + 16 }]} onPress={() => router.push('/cart')}>
            <Text style={styles.cartIconText}>🛒</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentMediaIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {product.media.map((media, index) => (
              <View key={index} style={[styles.mediaItem, { height: width * 1.3 + insets.top }]}>
                <MediaItem
                  media={media}
                  index={index}
                  isActive={index === currentMediaIndex}
                />
              </View>
            ))}
          </ScrollView>

          {/* Tap to zoom indicator */}
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>TAP TO ZOOM</Text>
          </View>

          {/* Heart/Save icon */}
          <TouchableOpacity style={styles.heartIcon}>
            <Text style={styles.heartText}>♡</Text>
          </TouchableOpacity>

          {/* Media dots indicator */}
          <View style={styles.dotsContainer}>
            {product.media.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentMediaIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleContainer}>
              <Text style={styles.productName}>{product.name}</Text>
              <TouchableOpacity>
                <Text style={styles.moreLink}>MORE →</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.merchantName}>By {product.merchant.displayName}</Text>
          </View>

          {/* Payment Options */}
          <View style={styles.paymentSection}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>Get it now, pay later</Text>
              <Text style={styles.paymentOptions}>3 OPTIONS →</Text>
            </View>
            <Text style={styles.paymentDescription}>
              Pay using our credit options, Payflex, PayJustNow, Mobicred or RCS.
            </Text>
          </View>

          {/* Size Selector */}
          {sizes.length > 0 && (
            <View style={styles.sizeSection}>
              <View style={styles.sizeHeader}>
                <Text style={styles.sizeTitle}>Select a size</Text>
                <TouchableOpacity>
                  <Text style={styles.sizeInfo}>SIZE INFO →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sizeOptions}>
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      selectedSize === size && styles.sizeButtonActive,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={styles.sizeText}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.findFitButton}>
                <Text style={styles.findFitIcon}>📏</Text>
                <Text style={styles.findFitText}>FIND YOUR FIT →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* More Options - Static for now */}
          <View style={styles.moreOptionsSection}>
            <View style={styles.moreOptionsHeader}>
              <Text style={styles.moreOptionsTitle}>More options</Text>
              <Text style={styles.moreOptionsCount}>2 Options</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.moreOptionsPlaceholder}>
                <Text style={styles.placeholderText}>Color variants coming soon</Text>
              </View>
            </ScrollView>
          </View>

          {/* Shipping */}
          <View style={styles.shippingSection}>
            <View style={styles.shippingHeader}>
              <Text style={styles.shippingTitle}>Shipping</Text>
              <TouchableOpacity>
                <Text style={styles.shippingLink}>When will I get it? →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.shippingOption}>
              <Text style={styles.shippingIcon}>🚚</Text>
              <View style={styles.shippingDetails}>
                <Text style={styles.shippingText}>FREE Standard delivery on orders over R650.</Text>
                <Text style={styles.shippingSubtext}>Faster options available.</Text>
              </View>
            </View>

            <View style={styles.shippingOption}>
              <Text style={styles.shippingIcon}>🏪</Text>
              <View style={styles.shippingDetails}>
                <Text style={styles.shippingText}>FREE Collection on orders over R650.</Text>
                <Text style={styles.shippingSubtext}>Open 7 days a week.</Text>
              </View>
            </View>
          </View>

          {/* Returns */}
          <View style={styles.returnsSection}>
            <Text style={styles.returnsTitle}>Returns</Text>
            <Text style={styles.returnsText}>Free exchange or return within 30 days</Text>
          </View>

          {/* Similar Items */}
          {similarData && similarData.products.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.similarTitle}>Similar Items</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similarData.products.map((item) => {
                  const localAsset = getLocalAsset(item.image);

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.similarItem}
                      onPress={() => router.push(`/product/${item.id}`)}
                    >
                      {localAsset ? (
                        <Image
                          source={localAsset}
                          style={styles.similarImage}
                          contentFit="cover"
                          onError={(e) => console.log('Similar item image error:', item.image, e.error)}
                          onLoad={() => console.log('Similar item loaded from local assets:', item.image)}
                        />
                      ) : (
                        <View style={[styles.similarImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
                          <Text style={{ color: '#999' }}>No image</Text>
                        </View>
                      )}
                      <Text style={styles.similarMerchant}>By {item.merchant.displayName}</Text>
                      <Text style={styles.similarPrice}>R{item.price.toFixed(2)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Bottom spacing for fixed cart button */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.bottomPrice}>R{product.price.toFixed(2)}</Text>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.cartButtonIcon}>🛒</Text>
          <Text style={styles.addToCartText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f00',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Hero Section
  heroSection: {
    position: 'relative',
  },
  backIcon: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backIconText: {
    fontSize: 24,
    color: '#000',
  },
  shareIcon: {
    position: 'absolute',
    right: 72,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  shareIconText: {
    fontSize: 20,
    color: '#000',
  },
  cartIcon: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cartIconText: {
    fontSize: 20,
  },
  mediaItem: {
    width: width,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#fff',
    fontSize: 14,
  },
  playPauseButton: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    marginLeft: -32,
    zIndex: 10,
  },
  playPauseIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  zoomIndicator: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  zoomText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heartIcon: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartText: {
    fontSize: 28,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  activeDot: {
    backgroundColor: '#fff',
  },

  // Product Info
  infoSection: {
    paddingHorizontal: 16,
  },
  productHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  moreLink: {
    fontSize: 14,
    color: '#666',
  },
  merchantName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },

  // Payment Options
  paymentSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentOptions: {
    fontSize: 14,
    color: '#666',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Size Selector
  sizeSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sizeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sizeInfo: {
    fontSize: 14,
    color: '#666',
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  sizeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
  },
  sizeButtonActive: {
    borderColor: '#000',
    borderWidth: 2,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  findFitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  findFitIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  findFitText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // More Options
  moreOptionsSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  moreOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moreOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  moreOptionsCount: {
    fontSize: 14,
    color: '#666',
  },
  moreOptionsPlaceholder: {
    width: 120,
    height: 160,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  // Shipping
  shippingSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shippingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shippingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  shippingLink: {
    fontSize: 14,
    color: '#666',
  },
  shippingOption: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  shippingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  shippingDetails: {
    flex: 1,
  },
  shippingText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  shippingSubtext: {
    fontSize: 13,
    color: '#666',
  },

  // Returns
  returnsSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  returnsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  returnsText: {
    fontSize: 14,
    color: '#666',
  },

  // Similar Items
  similarSection: {
    paddingVertical: 16,
  },
  similarTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  similarItem: {
    width: 200,
    marginRight: 12,
  },
  similarImage: {
    width: 200,
    height: 280,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  similarMerchant: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  similarPrice: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Didot',
  },

  bottomSpacing: {
    height: 80,
  },

  // Fixed Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 16,
    fontFamily: 'Didot',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
