import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { api } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { getLocalAsset } from '@/lib/local-assets';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'merchant';
  timestamp: Date;
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const merchantId = params.artistId as string;

  // Fetch merchant data from API
  const {
    data: merchantData,
    isLoading: merchantLoading,
    error: merchantError,
  } = useQuery({
    queryKey: ['merchant', merchantId],
    queryFn: () => api.getMerchantByUsername(merchantId),
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes
  });

  const merchant = merchantData?.merchant;

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize with welcome message once merchant data is loaded
  useEffect(() => {
    if (merchant && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hi there, we are ${merchant.displayName}. How can we assist you today?`,
        sender: 'merchant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [merchant]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Simulate merchant auto-reply after 2-3 seconds
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutoReply(),
        sender: 'merchant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, autoReply]);
    }, 2000 + Math.random() * 1000);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.sender === 'user';
    const logoAsset = merchant
      ? getLocalAsset(`/demo-assets/${merchant.username}/${merchant.logo}`)
      : null;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.artistMessageContainer,
        ]}
      >
        {!isUser && logoAsset && (
          <Image source={logoAsset} style={styles.messageAvatar} contentFit="cover" />
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.artistBubble]}>
          <Text
            style={[styles.messageText, isUser ? styles.userMessageText : styles.artistMessageText]}
          >
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.artistMessageTime]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  // Loading state
  if (merchantLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (merchantError || !merchant) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load chat</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const logoAsset = getLocalAsset(`/demo-assets/${merchant.username}/${merchant.logo}`);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          {logoAsset && (
            <Image source={logoAsset} style={styles.headerAvatar} contentFit="cover" />
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{merchant.displayName}</Text>
            <Text style={styles.headerSubtitle}>
              {merchant.isVerified ? 'Verified Artist' : 'Artist'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => router.push(`/artist/${merchant.username}`)}
        >
          <IconSymbol name="info.circle" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
              <IconSymbol name="plus.circle.fill" size={28} color="#007AFF" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder={`Message ${merchant.displayName}...`}
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              autoCorrect={true}
              autoCapitalize="sentences"
              returnKeyType="default"
              blurOnSubmit={false}
              editable={true}
            />

            <TouchableOpacity
              style={[styles.sendButton, inputText.trim().length === 0 && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={inputText.trim().length === 0}
            >
              <IconSymbol
                name="arrow.up.circle.fill"
                size={32}
                color={inputText.trim().length > 0 ? '#007AFF' : '#ccc'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerAction: {
    padding: 8,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  artistMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  artistBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  artistMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  artistMessageTime: {
    color: '#999',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    padding: 4,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    fontSize: 15,
    color: '#000',
  },
  sendButton: {
    padding: 4,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

// Auto-reply messages for simulation
const autoReplies = [
  "Thanks for your message! I'll get back to you shortly.",
  "I appreciate your interest! Let me know if you have any questions.",
  "Thank you for contacting me! I'm excited to help you.",
  "Hey! I received your message. I'll respond as soon as possible.",
  "Thanks for getting in touch! What can I assist you with?",
  "Hello! I'm glad you reached out. What would you like to know?",
  "I received your message! I'll get back to you soon.",
  "Thanks for your inquiry! I'm here to help.",
  "Hi there! Thanks for messaging. How may I assist you?",
  "Got it! Let me check on that for you.",
];

function getAutoReply(): string {
  return autoReplies[Math.floor(Math.random() * autoReplies.length)];
}
