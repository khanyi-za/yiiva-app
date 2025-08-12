import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface YiivaHeaderProps {
  onMenuPress: () => void;
  onCartPress: () => void;
}

export function YiivaHeader({ onMenuPress, onCartPress }: YiivaHeaderProps) {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <View style={styles.menuIcon}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </View>
      </TouchableOpacity>
      
      <Image 
        source={require('@/assets/images/ICON_BLACK.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />
      
      <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
        <IconSymbol size={24} name="cart" color="#333" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    gap: 3,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  logo: {
    height: 32,
    width: 120,
  },
  cartButton: {
    padding: 8,
  },
});