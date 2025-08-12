import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface ProductCardProps {
  productImage: any;
  profileImage: any;
  artistName: string;
  productTitle: string;
  price: string;
  timestamp: string;
  location: string;
  onBookmark?: () => void;
  onLike?: () => void;
  onMenuPress?: () => void;
}

export function ProductCard({
  productImage,
  profileImage,
  artistName,
  productTitle,
  price,
  timestamp,
  location,
  onBookmark,
  onLike,
  onMenuPress,
}: ProductCardProps) {
  const router = useRouter();

  const handleArtistPress = () => {
    // Convert artist name to URL-friendly format
    const artistId = artistName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/artist/${artistId}`);
  };
  return (
    <ThemedView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.profileInfo} onPress={handleArtistPress} activeOpacity={0.7}>
          <Image source={profileImage} style={styles.profileImage} />
          <View style={styles.profileText}>
            <View style={styles.nameTimeContainer}>
              <ThemedText style={styles.artistName}>{artistName}</ThemedText>
              <ThemedText style={styles.timestamp}> - {timestamp}</ThemedText>
            </View>
            <ThemedText style={styles.location}>{location}</ThemedText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <IconSymbol name="ellipsis" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={productImage} style={styles.productImage} />
      </View>
      
      {/* Product Info Footer */}
      <View style={styles.productFooter}>
        <View style={styles.productInfo}>
          <ThemedText style={styles.productTitle}>{productTitle}</ThemedText>
          <ThemedText style={styles.price}>{price}</ThemedText>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={onBookmark}>
            <IconSymbol name="bookmark" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <IconSymbol name="heart" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3.6,
    paddingLeft: 4,
    paddingRight: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  profileText: {
    flex: 1,
  },
  nameTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  timestamp: {
    fontSize: 14,
    color: '#999',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginTop: -2,
    lineHeight: 14,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  imageContainer: {
    marginLeft: -20,
    marginRight: -20,
    marginVertical: 2.4,
  },
  productImage: {
    width: '100%',
    height: 352,
    backgroundColor: '#f0f0f0',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});