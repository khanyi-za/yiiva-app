import { CategoryFilter } from '@/components/CategoryFilter';
import { FeedTabs } from '@/components/FeedTabs';
import { ProductCard } from '@/components/ProductCard';
import { RowProductList } from '@/components/RowProductList';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { YiivaHeader } from '@/components/YiivaHeader';
import { SideMenu } from '@/components/SideMenu';
import { useFilter } from '@/contexts/FilterContext';
import { useSocialStore } from '@/lib/social-store';
import { api } from '@/lib/api-client';
import { getLocalAsset } from '@/lib/local-assets';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

export default function HomeScreen() {
  const router = useRouter();
  const { activePrimaryFilter } = useFilter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const { toggleLike, toggleBookmark, isLiked, isBookmarked, toggleFollow, isFollowing } = useSocialStore();

  // TODO: Replace with API call - Mock brands data for now
  const trendingBrands = [
    {
      id: 'merchant-1',
      username: 'tol_thema',
      displayName: "Tol'thema",
      logo: { url: "/demo-assets/tol_thema/tol'thema-logo.png" },
    },
    {
      id: 'merchant-2',
      username: 'suhu',
      displayName: 'SUHU',
      logo: { url: '/demo-assets/suhu/suhu-logo.png' },
    },
  ];

  // Fetch main product feed
  const {
    data: feedData,
    isLoading: feedLoading,
    error: feedError,
    refetch: refetchFeed,
  } = useQuery({
    queryKey: ['products', 'feed', activePrimaryFilter],
    queryFn: () => api.getProductFeed({ genderType: activePrimaryFilter }),
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  });

  // Fetch featured products (random, no filters)
  const {
    data: featuredData,
    isLoading: featuredLoading,
  } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.getFeaturedProducts({ limit: 6 }),
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes (changes less frequently)
  });

  // Fetch new arrivals
  const {
    data: newArrivalsData,
    isLoading: newArrivalsLoading,
  } = useQuery({
    queryKey: ['products', 'new-arrivals', activePrimaryFilter],
    queryFn: () => api.getNewArrivals({ genderType: activePrimaryFilter, limit: 6 }),
    staleTime: 5 * 60 * 1000,
  });

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleCartPress = () => {
    router.push('/cart');
  };

  const handleNotificationsPress = () => {
    console.log('Notifications pressed');
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    console.log('Category changed to:', category);
    // TODO: Implement category filtering with GraphQL
  };

  const handleBookmark = (productId: string) => {
    toggleBookmark(productId);
  };

  const handleLike = (productId: string) => {
    toggleLike(productId);
  };

  const handleFeedTabChange = (tab: 'men' | 'women' | 'home-lifestyle') => {
    console.log('Feed tab changed to:', tab);
  };

  const handleSeeAll = (title: string) => {
    console.log('See all pressed:', title);
    router.push('/explore');
  };

  const handleLoadMore = () => {
    // TODO: Implement pagination with infinite scroll in future
    console.log('Load more - pagination to be implemented');
  };

  const handleRefresh = () => {
    refetchFeed();
  };

  const handleBrandPress = (username: string) => {
    router.push(`/artist/${username}`);
  };

  const handleFollowPress = (brandId: string) => {
    toggleFollow(brandId);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SideMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        userName="Khanyisomthamo2"
      />
      <YiivaHeader
        onMenuPress={handleMenuPress}
        onCartPress={handleCartPress}
        onNotificationsPress={handleNotificationsPress}
      />

      <FeedTabs onTabChange={handleFeedTabChange} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <CategoryFilter
          onCategoryChange={handleCategoryChange}
          primaryFilter={activePrimaryFilter}
        />

        {/* Loading State */}
        {feedLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
          </View>
        )}

        {/* Error State */}
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

        {/* Content */}
        {!feedLoading && !feedError && (
          <ThemedView style={styles.feed}>
            {/* Main product feed - 2 column grid with interleaved content */}
            {(() => {
              const products = feedData?.products || [];
              const content = [];
              let productIndex = 0;

              // Helper to create a grid row with 2 products
              const createGridRow = (startIndex: number) => {
                const rowProducts = [];
                for (let i = 0; i < 2 && startIndex + i < products.length; i++) {
                  const product = products[startIndex + i];
                  const productImage = getLocalAsset(product.primaryImage);
                  const merchantLogo = product.merchant.logo ? getLocalAsset(product.merchant.logo) : undefined;

                  rowProducts.push(
                    <View key={product.id} style={styles.gridItem}>
                      <ProductCard
                        productImage={productImage || { uri: product.primaryImage }}
                        profileImage={merchantLogo}
                        artistName={product.merchant.displayName}
                        productTitle={product.name}
                        price={`R${product.price.toFixed(2)}`}
                        location={`${product.merchant.username}`}
                        productId={product.id}
                        artistId={product.merchant.username}
                        onBookmark={() => handleBookmark(product.id)}
                        onLike={() => handleLike(product.id)}
                        isLiked={isLiked(product.id)}
                        isBookmarked={isBookmarked(product.id)}
                      />
                    </View>
                  );
                }
                return rowProducts;
              };

              // First 3 rows (6 products)
              for (let row = 0; row < 3 && productIndex < products.length; row++) {
                content.push(
                  <View key={`row-${row}`} style={styles.gridRow}>
                    {createGridRow(productIndex)}
                  </View>
                );
                productIndex += 2;
              }

              // Insert New Arrivals after 3 rows
              if (productIndex >= 6 && newArrivalsData?.products && newArrivalsData.products.length > 0) {
                content.push(
                  <RowProductList
                    key="new-arrivals"
                    title="New Arrivals"
                    products={newArrivalsData.products.map(p => {
                      const localImage = getLocalAsset(p.image);
                      return {
                        id: p.id,
                        image: localImage || { uri: p.image },
                        title: p.name,
                        artistName: p.merchant.displayName,
                        price: `R${p.price.toFixed(2)}`,
                      };
                    })}
                    onSeeAll={() => handleSeeAll('New Arrivals')}
                  />
                );
              }

              // Next 3 rows (6 more products)
              for (let row = 0; row < 3 && productIndex < products.length; row++) {
                content.push(
                  <View key={`row-${row + 3}`} style={styles.gridRow}>
                    {createGridRow(productIndex)}
                  </View>
                );
                productIndex += 2;
              }

              // Insert Trending Brands after 6 more rows
              if (productIndex >= 12 && trendingBrands.length > 0) {
                content.push(
                  <View key="trending-brands" style={styles.brandsSection}>
                    <View style={styles.brandsSectionHeader}>
                      <ThemedText style={styles.brandsSectionTitle}>Trending Brands</ThemedText>
                      <TouchableOpacity onPress={() => router.push('/explore')}>
                        <ThemedText style={styles.seeAllText}>See All</ThemedText>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.brandsContainer}
                    >
                      {trendingBrands.map((brand) => (
                        <TouchableOpacity
                          key={brand.id}
                          style={styles.brandCard}
                          onPress={() => handleBrandPress(brand.username)}
                          activeOpacity={0.9}
                        >
                          {brand.logo ? (
                            <Image source={getLocalAsset(brand.logo.url)} style={styles.brandLogo} />
                          ) : (
                            <View style={[styles.brandLogo, styles.brandPlaceholder]}>
                              <ThemedText style={styles.brandInitial}>
                                {brand.displayName.charAt(0).toUpperCase()}
                              </ThemedText>
                            </View>
                          )}
                          <ThemedText style={styles.brandName} numberOfLines={1}>
                            {brand.displayName}
                          </ThemedText>
                          <TouchableOpacity
                            style={[
                              styles.followButton,
                              isFollowing(brand.id) && styles.followingButton,
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleFollowPress(brand.id);
                            }}
                          >
                            <ThemedText
                              style={[
                                styles.followButtonText,
                                isFollowing(brand.id) && styles.followingButtonText,
                              ]}
                            >
                              {isFollowing(brand.id) ? 'Following' : 'Follow'}
                            </ThemedText>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                );
              }

              // Remaining products in grid
              while (productIndex < products.length) {
                content.push(
                  <View key={`row-remaining-${productIndex}`} style={styles.gridRow}>
                    {createGridRow(productIndex)}
                  </View>
                );
                productIndex += 2;
              }

              return content;
            })()}
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  feed: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  brandsSection: {
    marginVertical: 20,
  },
  brandsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  brandsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  brandsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  brandCard: {
    width: 120,
    alignItems: 'center',
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  brandPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  brandInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: '#666',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  followButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  followingButtonText: {
    color: '#666',
  },
});
