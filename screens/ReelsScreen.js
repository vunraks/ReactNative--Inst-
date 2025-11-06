import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Моковые данные для Reels
const mockReels = [
  {
    id: '1',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    username: 'travel_lover',
    description: 'Amazing mountain views 🏔️ #travel #nature',
    likes: 12500,
    comments: 342,
    isLiked: false,
  },
  {
    id: '2',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    username: 'tech_review',
    description: 'New gadget unboxing! 📱 #tech #unboxing',
    likes: 8900,
    comments: 156,
    isLiked: true,
  },
  {
    id: '3',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    username: 'cooking_master',
    description: 'Delicious pasta recipe 🍝 #cooking #food',
    likes: 21500,
    comments: 789,
    isLiked: false,
  },
];

export default function ReelsScreen() {
  const [reels, setReels] = useState(mockReels);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef([]);

  // Автоматическое воспроизведение текущего видео
  useEffect(() => {
    if (videoRefs.current[currentReelIndex]) {
      videoRefs.current[currentReelIndex].playAsync();
    }
  }, [currentReelIndex]);

  const togglePlayPause = async () => {
    if (videoRefs.current[currentReelIndex]) {
      if (isPlaying) {
        await videoRefs.current[currentReelIndex].pauseAsync();
      } else {
        await videoRefs.current[currentReelIndex].playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleLike = (reelId) => {
    setReels(prevReels =>
      prevReels.map(reel =>
        reel.id === reelId
          ? {
              ...reel,
              likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
              isLiked: !reel.isLiked,
            }
          : reel
      )
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setCurrentReelIndex(newIndex);
      setIsPlaying(true);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderReel = ({ item, index }) => (
    <View style={styles.reelContainer}>
      {/* Видео */}
      <Video
        ref={ref => (videoRefs.current[index] = ref)}
        source={{ uri: item.video }}
        style={styles.video}
        resizeMode="cover"
        shouldPlay={index === currentReelIndex}
        isLooping
        useNativeControls={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            // Автопереход к следующему видео при завершении
            if (index < reels.length - 1) {
              setCurrentReelIndex(index + 1);
            }
          }
        }}
      />

      {/* Затемнение для лучшей читаемости текста */}
      <View style={styles.overlay} />

      {/* Контент поверх видео */}
      <View style={styles.content}>
        {/* Информация о пользователе и описание */}
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={24} color="white" />
          </View>
          <Text style={styles.username}>@{item.username}</Text>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followText}>Подписаться</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        {/* Аудио информация */}
        <View style={styles.audioInfo}>
          <Ionicons name="musical-notes" size={16} color="white" />
          <Text style={styles.audioText}>Original Sound</Text>
        </View>
      </View>

      {/* Боковая панель действий */}
      <View style={styles.actionsPanel}>
        {/* Аватар пользователя */}
        <TouchableOpacity style={styles.actionAvatar}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color="white" />
          </View>
          <Ionicons name="add-circle" size={16} color="#FF3040" style={styles.addIcon} />
        </TouchableOpacity>

        {/* Действия */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleLike(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={32} 
            color={item.isLiked ? "#FF3040" : "white"} 
          />
          <Text style={styles.actionCount}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={28} color="white" />
          <Text style={styles.actionCount}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={28} color="white" />
          <Text style={styles.actionCount}>Поделиться</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>

        {/* Крутящийся диск */}
        <View style={styles.musicDisc}>
          <Ionicons name="musical-notes" size={24} color="white" />
        </View>
      </View>

      {/* Кнопка play/pause */}
      <TouchableOpacity 
        style={styles.playPauseButton}
        onPress={togglePlayPause}
      >
        <Ionicons 
          name={isPlaying && index === currentReelIndex ? "pause" : "play"} 
          size={48} 
          color="rgba(255,255,255,0.8)" 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Хедер Reels */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Список Reels */}
      <FlatList
        data={reels}
        keyExtractor={item => item.id}
        renderItem={renderReel}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
        snapToInterval={screenHeight}
        snapToAlignment="start"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  reelContainer: {
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 100,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  username: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 12,
  },
  followButton: {
    backgroundColor: '#0095F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  followText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  actionsPanel: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
  },
  actionAvatar: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  addIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionCount: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  musicDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    marginTop: 10,
  },
  playPauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});