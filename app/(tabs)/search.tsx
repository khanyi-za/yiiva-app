import { CategoryFilter } from '@/components/CategoryFilter';
import { MasonryGrid } from '@/components/MasonryGrid';
import { ProductCard } from '@/components/ProductCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchResult {
  id: string;
  productImage: any;
  profileImage: any;
  artistName: string;
  productTitle: string;
  price: string;
  timestamp: string;
  location: string;
}

interface MasonryItem {
  id: string;
  image: any;
  brand?: string;
  title: string;
  price: string;
  height?: number;
}

const sampleSearchData: SearchResult[] = [
  {
    id: '1',
    productImage: require('@/assets/images/masonwabe_jersey.png'),
    profileImage: require('@/assets/images/ masonwabe_profile_pic.png'),
    artistName: 'Masonwabe Ntloko',
    productTitle: 'Rectangular Rug',
    price: 'R3500.67',
    timestamp: '3days',
    location: 'Johannesburg',
  },
  {
    id: '2',
    productImage: require('@/assets/images/jersey_below.png'),
    profileImage: require('@/assets/images/ masonwabe_profile_pic.png'),
    artistName: 'Mason Mount',
    productTitle: 'Urban Collection',
    price: 'R2750.00',
    timestamp: '5days',
    location: 'Cape Town',
  },
  {
    id: '3',
    productImage: require('@/assets/images/masonwabe_jersey.png'),
    profileImage: require('@/assets/images/ masonwabe_profile_pic.png'),
    artistName: 'Artist Name',
    productTitle: 'Test Product',
    price: 'R1200.00',
    timestamp: '1day',
    location: 'Durban',
  },
];

const sampleMasonryData: MasonryItem[] = [
  {
    id: '1',
    image: require('@/assets/images/masonwabe_jersey.png'),
    brand: 'PacSun',
    title: 'Levi\'s Womens Abraided...',
    price: '$79.50',
    height: 280,
  },
  {
    id: '2',
    image: require('@/assets/images/jersey_below.png'),
    brand: 'American Eagle',
    title: 'AE Strigid Curvy Super Hi...',
    price: '$37.46',
    height: 320,
  },
  {
    id: '3',
    image: require('@/assets/images/masonwabe_jersey.png'),
    brand: 'Buckle',
    title: 'Urban Style Collection',
    price: '$65.00',
    height: 240,
  },
  {
    id: '4',
    image: require('@/assets/images/jersey_below.png'),
    brand: 'H&M',
    title: 'Modern Fit Jeans',
    price: '$29.99',
    height: 260,
  },
  {
    id: '5',
    image: require('@/assets/images/masonwabe_jersey.png'),
    brand: 'Zara',
    title: 'Premium Denim Collection',
    price: '$89.95',
    height: 300,
  },
  {
    id: '6',
    image: require('@/assets/images/jersey_below.png'),
    brand: 'Forever 21',
    title: 'Casual Weekend Wear',
    price: '$24.90',
    height: 220,
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Abstract Art',
    'Handmade Rugs',
    'Urban Style',
    'Local Artists',
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setIsSearching(true);
      // Simulate search - filter sample data
      const filtered = sampleSearchData.filter(item =>
        item.productTitle.toLowerCase().includes(query.toLowerCase()) ||
        item.artistName.toLowerCase().includes(query.toLowerCase()) ||
        item.location.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleRecentSearchPress = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const clearRecentSearch = (index: number) => {
    const updated = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(updated);
  };

  const handleCategoryChange = (category: string) => {
    console.log('Category filter:', category);
    // Implement category filtering logic
  };

  const handleBookmark = () => {
    console.log('Bookmarked');
  };

  const handleLike = () => {
    console.log('Liked');
  };

  const handleProductMenuPress = () => {
    console.log('Product menu pressed');
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    if (searchQuery.length === 0) {
      setIsSearchFocused(false);
    }
  };

  const handleMasonryItemPress = (item: MasonryItem) => {
    console.log('Masonry item pressed:', item.title);
  };


  return (
    <ThemedView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search artists, products, locations..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      {!isSearchFocused && !isSearching && (
        <CategoryFilter onCategoryChange={handleCategoryChange} />
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isSearchFocused && !isSearching && (
          /* Recent Searches & Suggestions */
          <View style={styles.content}>
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Recent Searches</ThemedText>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentSearchItem}
                    onPress={() => handleRecentSearchPress(search)}
                  >
                    <IconSymbol name="clock" size={16} color="#666" />
                    <ThemedText style={styles.recentSearchText}>{search}</ThemedText>
                    <TouchableOpacity
                      onPress={() => clearRecentSearch(index)}
                      style={styles.clearRecentButton}
                    >
                      <IconSymbol name="xmark" size={14} color="#999" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Trending</ThemedText>
              <View style={styles.trendingTags}>
                {['#HandmadeArt', '#LocalArtists', '#VintageRugs', '#ModernDesign', '#SouthAfricanArt'].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.trendingTag}
                    onPress={() => handleSearch(tag.substring(1))}
                  >
                    <ThemedText style={styles.trendingTagText}>{tag}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
        
        {isSearching && (
          /* Search Results */
          <View style={styles.resultsContainer}>
            <ThemedText style={styles.resultsHeader}>
              {searchResults.length} results for "{searchQuery}"
            </ThemedText>
            
            {searchResults.length > 0 && (
              <View style={styles.results}>
                {searchResults.map((item) => (
                  <ProductCard
                    key={item.id}
                    productImage={item.productImage}
                    profileImage={item.profileImage}
                    artistName={item.artistName}
                    productTitle={item.productTitle}
                    price={item.price}
                    timestamp={item.timestamp}
                    location={item.location}
                    onBookmark={handleBookmark}
                    onLike={handleLike}
                    onMenuPress={handleProductMenuPress}
                  />
                ))}
              </View>
            )}
            
            {searchResults.length === 0 && (
              <View style={styles.noResults}>
                <IconSymbol name="magnifyingglass" size={48} color="#ccc" />
                <ThemedText style={styles.noResultsTitle}>No results found</ThemedText>
                <ThemedText style={styles.noResultsText}>
                  Try adjusting your search or browse by category
                </ThemedText>
              </View>
            )}
          </View>
        )}
        
        {!isSearchFocused && !isSearching && (
          /* Default Masonry Grid */
          <View style={styles.masonryContainer}>
            <MasonryGrid
              data={sampleMasonryData}
              onItemPress={handleMasonryItemPress}
            />
          </View>
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
  searchHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  clearButton: {
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentSearchText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  clearRecentButton: {
    padding: 4,
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trendingTagText: {
    fontSize: 14,
    color: '#666',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 20,
  },
  results: {
    paddingBottom: 100,
  },
  noResults: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  masonryContainer: {
    paddingTop: 16,
    paddingBottom: 100,
  },
});