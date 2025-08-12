import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MasonryGrid } from '@/components/MasonryGrid';

interface ArtistProduct {
  id: string;
  title: string;
  price: string;
  image: any;
  category: string;
  dimensions?: string;
}

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

const { width: screenWidth } = Dimensions.get('window');

// Mock artist data - in real app this would come from API
const mockArtists: { [key: string]: Artist } = {
  'masonwabe-ntloko': {
    id: 'masonwabe-ntloko',
    name: 'masonwabe-ntloko',
    displayName: 'MASONWABE NTLOKO',
    profileImage: require('@/assets/images/ masonwabe_profile_pic.png'),
    heroImage: require('@/assets/design_screenshots/artist_profile_hero.png'),
    followers: '12.4K',
    following: '432',
    posts: '127',
    bio: 'Traditional craft meets modern art. Creating pieces that tell stories of our heritage.',
    location: 'Johannesburg, South Africa',
    isFollowing: false,
    categories: ['All', 'Knitwear', 'Rugs', 'Paintings'],
    products: [
      {
        id: '1',
        title: 'Sisipho rectangular Rug',
        price: 'R3,600',
        image: require('@/assets/images/masonwabe_jersey.png'),
        category: 'Rugs',
        dimensions: '120 x 180cm'
      },
      {
        id: '2', 
        title: 'Circular Rug',
        price: 'R4,200',
        image: require('@/assets/images/jersey_below.png'),
        category: 'Rugs',
        dimensions: '150cm diameter'
      },
      {
        id: '3',
        title: 'Heritage Painting',
        price: 'R2,800',
        image: require('@/assets/images/masonwabe_jersey.png'),
        category: 'Paintings',
        dimensions: '60 x 80cm'
      },
      {
        id: '4',
        title: 'Traditional Knit Sweater',
        price: 'R1,450',
        image: require('@/assets/images/jersey_below.png'),
        category: 'Knitwear',
      },
      {
        id: '5',
        title: 'Modern Art Piece',
        price: 'R5,200',
        image: require('@/assets/images/masonwabe_jersey.png'),
        category: 'Paintings',
        dimensions: '90 x 120cm'
      },
      {
        id: '6',
        title: 'Woven Wall Art',
        price: 'R3,100',
        image: require('@/assets/images/jersey_below.png'),
        category: 'Rugs',
        dimensions: '80 x 100cm'
      }
    ]
  },
  'thabo-designs': {
    id: 'thabo-designs',
    name: 'thabo-designs', 
    displayName: 'THABO DESIGNS',
    profileImage: require('@/assets/images/ masonwabe_profile_pic.png'),
    heroImage: require('@/assets/design_screenshots/artist_profile_hero.png'),
    followers: '8.9K',
    following: '256',
    posts: '89',
    bio: 'Street art meets fashion. Contemporary designs inspired by urban culture.',
    location: 'Cape Town, South Africa',
    isFollowing: true,
    categories: ['All', 'Fashion', 'Art', 'Accessories'],
    products: [
      {
        id: '1',
        title: 'Urban Collection Tee',
        price: 'R450',
        image: require('@/assets/images/jersey_below.png'),
        category: 'Fashion',
      },
      {
        id: '2',
        title: 'Street Art Print',
        price: 'R1,200',
        image: require('@/assets/images/masonwabe_jersey.png'),
        category: 'Art',
        dimensions: '50 x 70cm'
      }
    ]
  }
};

export default function ArtistProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFollowing, setIsFollowing] = useState(false);
  const insets = useSafeAreaInsets();

  const artistId = params.artistId as string;
  const artist = mockArtists[artistId];

  React.useEffect(() => {
    if (artist) {
      setIsFollowing(artist.isFollowing);
    }
  }, [artist]);

  if (!artist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Artist not found</ThemedText>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filteredProducts = selectedCategory === 'All' 
    ? artist.products 
    : artist.products.filter(product => product.category === selectedCategory);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleContact = () => {
    console.log('Contact artist:', artist.name);
    // Implement contact functionality
  };

  const handleProductPress = (product: ArtistProduct) => {
    console.log('Product pressed:', product.title);
    // Navigate to product detail page
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroSection, { height: (400 * 1.12 * 1.13 * 0.9 * 0.95) + insets.top }]}>
          <Image source={artist.heroImage} style={styles.heroImage} />
          
          {/* Hero Overlay */}
          <View style={styles.heroOverlay}>
            {/* Close Button */}
            <TouchableOpacity 
              style={[styles.closeButton, { top: insets.top + 20 }]}
              onPress={() => router.back()}
            >
              <IconSymbol name="xmark" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Artist Name */}
            <View style={[styles.artistNameContainer, { top: insets.top + 20 }]}>
              <ThemedText style={styles.artistName}>{artist.displayName}</ThemedText>
            </View>

            {/* Profile Picture */}
            <View style={styles.profilePictureContainer}>
              <Image source={artist.profileImage} style={styles.profilePicture} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollow}
          >
            <ThemedText style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <ThemedText style={styles.contactButtonText}>Contact</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{artist.posts}</ThemedText>
            <ThemedText style={styles.statLabel}>Posts</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{artist.followers}</ThemedText>
            <ThemedText style={styles.statLabel}>Followers</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{artist.following}</ThemedText>
            <ThemedText style={styles.statLabel}>Following</ThemedText>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <ThemedText style={styles.bioText}>{artist.bio}</ThemedText>
          <View style={styles.locationContainer}>
            <IconSymbol name="location" size={14} color="#666" />
            <ThemedText style={styles.locationText}>{artist.location}</ThemedText>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.categorySection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContainer}
          >
            {artist.categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  selectedCategory === category && styles.selectedCategoryTab
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <ThemedText
                  style={[
                    styles.categoryTabText,
                    selectedCategory === category && styles.selectedCategoryTabText
                  ]}
                >
                  {category}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <MasonryGrid
            data={filteredProducts}
            renderItem={({ item: product }) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => handleProductPress(product)}
                activeOpacity={0.9}
              >
                <Image source={product.image} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <ThemedText style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </ThemedText>
                  <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
                  {product.dimensions && (
                    <ThemedText style={styles.productDimensions}>{product.dimensions}</ThemedText>
                  )}
                </View>
              </TouchableOpacity>
            )}
            spacing={12}
            columns={2}
          />
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  heroSection: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistNameContainer: {
    position: 'absolute',
    left: 80,
    right: 20,
  },
  artistName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  profilePictureContainer: {
    position: 'absolute',
    bottom: -30,
    left: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 12,
  },
  followButton: {
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    flex: 1,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#666',
  },
  contactButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    flex: 1,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bioSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bioText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  categorySection: {
    paddingVertical: 16,
  },
  categoryScrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryTab: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedCategoryTab: {
    backgroundColor: 'transparent',
    borderBottomColor: '#000',
  },
  categoryTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  selectedCategoryTabText: {
    color: '#000',
    fontWeight: '600',
  },
  productsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  productDimensions: {
    fontSize: 12,
    color: '#666',
  },
  bottomPadding: {
    height: 100,
  },
});