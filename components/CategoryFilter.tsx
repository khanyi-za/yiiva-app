import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface CategoryFilterProps {
  onCategoryChange: (category: string) => void;
}

const categories = ['All', 'Jerseys', 'Art', 'Fashion', 'Electronics', 'Home'];

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <ThemedText
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}
            >
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    minWidth: 60,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
});