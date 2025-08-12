import { CategoryFilter } from '@/components/CategoryFilter';
import { FeedTabs } from '@/components/FeedTabs';
import { ProductCard } from '@/components/ProductCard';
import { ThemedView } from '@/components/ThemedView';
import { YiivaHeader } from '@/components/YiivaHeader';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const handleMenuPress = () => {
    // Handle menu press
    console.log('Menu pressed');
  };

  const handleCartPress = () => {
    // Handle cart press
    console.log('Cart pressed');
  };

  const handleCategoryChange = (category: string) => {
    // Handle category filter change
    console.log('Category changed to:', category);
  };

  const handleBookmark = () => {
    // Handle bookmark action
    console.log('Bookmarked');
  };

  const handleLike = () => {
    // Handle like action
    console.log('Liked');
  };

  const handleProductMenuPress = () => {
    // Handle product menu press
    console.log('Product menu pressed');
  };

  const handleFeedTabChange = (tab: 'foryou' | 'following') => {
    // Handle feed tab change
    console.log('Feed tab changed to:', tab);
  };

  return (
    <ThemedView style={styles.container}>
      <YiivaHeader 
        onMenuPress={handleMenuPress}
        onCartPress={handleCartPress}
      />
      
      <FeedTabs onTabChange={handleFeedTabChange} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <CategoryFilter onCategoryChange={handleCategoryChange} />
        
        <ThemedView style={styles.feed}>
          <ProductCard
            productImage={require('@/assets/images/masonwabe_jersey.png')}
            profileImage={require('@/assets/images/ masonwabe_profile_pic.png')}
            artistName="Masonwabe Ntloko"
            productTitle="Rectangular Rug"
            price="R3500.67"
            timestamp="3days"
            location="Johannesburg"
            onBookmark={handleBookmark}
            onLike={handleLike}
            onMenuPress={handleProductMenuPress}
          />
          
          <ProductCard
            productImage={require('@/assets/images/jersey_below.png')}
            profileImage={require('@/assets/images/ masonwabe_profile_pic.png')}
            artistName="Mason Mount"
            productTitle="Urban Collection"
            price="R2750.00"
            timestamp="5days"
            location="Cape Town"
            onBookmark={handleBookmark}
            onLike={handleLike}
            onMenuPress={handleProductMenuPress}
          />
          
          <ProductCard
            productImage={require('@/assets/images/masonwabe_jersey.png')}
            profileImage={require('@/assets/images/ masonwabe_profile_pic.png')}
            artistName="Artist Name"
            productTitle="Test Product"
            price="R1200.00"
            timestamp="1day"
            location="Durban"
            onBookmark={handleBookmark}
            onLike={handleLike}
            onMenuPress={handleProductMenuPress}
          />
        </ThemedView>
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
    paddingHorizontal: 20,
    paddingBottom: 100, // Add bottom padding for tab bar
  },
});