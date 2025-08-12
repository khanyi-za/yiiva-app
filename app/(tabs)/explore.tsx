import { CategoryFilter } from '@/components/CategoryFilter';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { VideoCard } from '@/components/VideoCard';
import { YiivaHeader } from '@/components/YiivaHeader';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface FeaturedCollection {
  id: string;
  title: string;
  subtitle: string;
  image: any;
  itemCount: number;
}

interface TrendingArtist {
  id: string;
  name: string;
  image: any;
  followers: string;
  isFollowing: boolean;
}

interface VideoItem {
  id: string;
  videoThumbnail: any;
  artistImage: any;
  artistName: string;
  videoTitle: string;
  likes: string;
  isLiked: boolean;
}

const featuredCollections: FeaturedCollection[] = [
  {
    id: '1',
    title: 'South African Heritage',
    subtitle: 'Traditional crafts & modern art',
    image: require('@/assets/images/masonwabe_jersey.png'),
    itemCount: 127,
  },
  {
    id: '2',
    title: 'Urban Street Style',
    subtitle: 'Contemporary fashion pieces',
    image: require('@/assets/images/jersey_below.png'),
    itemCount: 89,
  },
];

const trendingArtists: TrendingArtist[] = [
  {
    id: '1',
    name: 'Masonwabe Ntloko',
    image: require('@/assets/images/ masonwabe_profile_pic.png'),
    followers: '12.4K',
    isFollowing: false,
  },
  {
    id: '2',
    name: 'Thabo Designs',
    image: require('@/assets/images/ masonwabe_profile_pic.png'),
    followers: '8.9K',
    isFollowing: true,
  },
  {
    id: '3',
    name: 'Nomsa Crafts',
    image: require('@/assets/images/ masonwabe_profile_pic.png'),
    followers: '15.2K',
    isFollowing: false,
  },
];

const curatedVideos: VideoItem[] = [
  {
    id: '1',
    videoThumbnail: require('@/assets/images/masonwabe_jersey.png'),
    artistImage: require('@/assets/images/ masonwabe_profile_pic.png'),
    artistName: 'Masonwabe Ntloko',
    videoTitle: 'Creating traditional beadwork patterns - Behind the scenes',
    likes: '12.4K',
    isLiked: false,
  },
  {
    id: '2',
    videoThumbnail: require('@/assets/images/jersey_below.png'),
    artistImage: require('@/assets/images/ masonwabe_profile_pic.png'),
    artistName: 'Thabo Designs',
    videoTitle: 'Street art meets fashion - My creative process',
    likes: '8.9K',
    isLiked: true,
  },
  {
    id: '3',
    videoThumbnail: require('@/assets/images/masonwabe_jersey.png'),
    artistImage: require('@/assets/images/ masonwabe_profile_pic.png'),
    artistName: 'Nomsa Crafts',
    videoTitle: 'Hand-weaving techniques passed down generations',
    likes: '15.2K',
    isLiked: false,
  },
];

export default function ExploreScreen() {
  const [followingArtists, setFollowingArtists] = useState<Set<string>>(new Set(['2']));
  const router = useRouter();

  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  const handleCartPress = () => {
    console.log('Cart pressed');
  };

  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category);
  };

  const handleCollectionPress = (collection: FeaturedCollection) => {
    console.log('Collection pressed:', collection.title);
  };

  const handleArtistPress = (artist: TrendingArtist) => {
    console.log('Artist pressed:', artist.name);
  };

  const handleFollowPress = (artistId: string) => {
    setFollowingArtists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(artistId)) {
        newSet.delete(artistId);
      } else {
        newSet.add(artistId);
      }
      return newSet;
    });
  };

  const handleVideoPlay = (videoId: string) => {
    router.push({
      pathname: '/video-player',
      params: { videoId }
    });
  };

  const handleVideoLike = (videoId: string) => {
    console.log('Video liked:', videoId);
  };

  const handleVideoArtistPress = (artistName: string) => {
    console.log('Video artist pressed:', artistName);
  };

  return (
    <ThemedView style={styles.container}>
      <YiivaHeader 
        onMenuPress={handleMenuPress}
        onCartPress={handleCartPress}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured Collections */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Featured Collections</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.collectionsContainer}
          >
            {featuredCollections.map((collection) => (
              <TouchableOpacity
                key={collection.id}
                style={styles.collectionCard}
                onPress={() => handleCollectionPress(collection)}
                activeOpacity={0.9}
              >
                <Image source={collection.image} style={styles.collectionImage} />
                <View style={styles.collectionOverlay}>
                  <View style={styles.collectionContent}>
                    <ThemedText style={styles.collectionTitle}>{collection.title}</ThemedText>
                    <ThemedText style={styles.collectionSubtitle}>{collection.subtitle}</ThemedText>
                    <ThemedText style={styles.collectionCount}>{collection.itemCount} items</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Artists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Trending Artists</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.artistsContainer}
          >
            {trendingArtists.map((artist) => (
              <TouchableOpacity
                key={artist.id}
                style={styles.artistCard}
                onPress={() => handleArtistPress(artist)}
                activeOpacity={0.9}
              >
                <Image source={artist.image} style={styles.artistImage} />
                <ThemedText style={styles.artistName} numberOfLines={1}>{artist.name}</ThemedText>
                <ThemedText style={styles.artistFollowers}>{artist.followers} followers</ThemedText>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    followingArtists.has(artist.id) && styles.followingButton
                  ]}
                  onPress={() => handleFollowPress(artist.id)}
                >
                  <ThemedText style={[
                    styles.followButtonText,
                    followingArtists.has(artist.id) && styles.followingButtonText
                  ]}>
                    {followingArtists.has(artist.id) ? 'Following' : 'Follow'}
                  </ThemedText>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Filter */}
        <CategoryFilter onCategoryChange={handleCategoryChange} />

        {/* Curated Videos */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Curated for You</ThemedText>
          <View style={styles.videosContainer}>
            {curatedVideos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                videoThumbnail={video.videoThumbnail}
                artistImage={video.artistImage}
                artistName={video.artistName}
                videoTitle={video.videoTitle}
                likes={video.likes}
                isLiked={video.isLiked}
                onPlay={() => handleVideoPlay(video.id)}
                onLike={() => handleVideoLike(video.id)}
                onArtistPress={() => handleVideoArtistPress(video.artistName)}
              />
            ))}
          </View>
        </View>
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  collectionsContainer: {
    paddingRight: 20,
    gap: 16,
  },
  collectionCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  collectionContent: {
    padding: 20,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  collectionSubtitle: {
    fontSize: 14,
    color: '#f0f0f0',
    marginBottom: 8,
  },
  collectionCount: {
    fontSize: 12,
    color: '#ddd',
  },
  artistsContainer: {
    paddingRight: 20,
    gap: 16,
  },
  artistCard: {
    width: 120,
    alignItems: 'center',
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  artistFollowers: {
    fontSize: 12,
    color: '#666',
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
  videosContainer: {
    paddingTop: 8,
  },
});
