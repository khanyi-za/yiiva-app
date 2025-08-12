import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface FeedTabsProps {
  onTabChange?: (tab: 'foryou' | 'following') => void;
}

export function FeedTabs({ onTabChange }: FeedTabsProps) {
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');

  const handleTabPress = (tab: 'foryou' | 'following') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={styles.tab}
        onPress={() => handleTabPress('foryou')}
      >
        <ThemedText style={[
          styles.tabText, 
          activeTab === 'foryou' && styles.activeTabText
        ]}>
          For you
        </ThemedText>
        {activeTab === 'foryou' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.tab}
        onPress={() => handleTabPress('following')}
      >
        <ThemedText style={[
          styles.tabText, 
          activeTab === 'following' && styles.activeTabText
        ]}>
          Following
        </ThemedText>
        {activeTab === 'following' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: '#fff',
    gap: 30,
    justifyContent: 'center',
  },
  tab: {
    alignItems: 'center',
    paddingBottom: 5,
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  activeIndicator: {
    width: '100%',
    height: 2,
    backgroundColor: '#333',
    marginTop: 8,
    borderRadius: 1,
  },
});