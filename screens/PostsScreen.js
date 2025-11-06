import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebaseConfig";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

const { width } = Dimensions.get('window');
const imageSize = (width - 4) / 3; // Для сетки 3 колонки

export default function PostsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' или 'list'

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setPosts(postsData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Функция для форматирования времени
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Недавно';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    
    if (diff < minute) {
      return 'Только что';
    } else if (diff < hour) {
      const minutes = Math.floor(diff / minute);
      return `${minutes} мин`;
    } else if (diff < day) {
      const hours = Math.floor(diff / hour);
      return `${hours} ч`;
    } else {
      const days = Math.floor(diff / day);
      return `${days} д`;
    }
  };

  // Рендер элемента в виде сетки (как в Instagram)
  const renderGridItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
      {item.text && (
        <View style={styles.textOverlay}>
          <Ionicons name="document-text" size={16} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  // Рендер элемента в виде списка
  const renderListItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.listImage} />
      <View style={styles.listContent}>
        <Text style={styles.listUsername}>{item.username}</Text>
        <Text style={styles.listText} numberOfLines={2}>
          {item.text || "Фото"}
        </Text>
        <Text style={styles.listTime}>
          {formatTimeAgo(item.createdAt)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#8e8e8e" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0095F6" />
        <Text style={styles.loadingText}>Загрузка публикаций...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Заголовок и переключатель вида */}
      <View style={styles.header}>
        <Text style={styles.title}>Все публикации</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'grid' && styles.activeToggle]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons 
              name="grid" 
              size={20} 
              color={viewMode === 'grid' ? '#0095F6' : '#8e8e8e'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={viewMode === 'list' ? '#0095F6' : '#8e8e8e'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Статистика */}
      <View style={styles.stats}>
        <Text style={styles.statCount}>{posts.length}</Text>
        <Text style={styles.statLabel}>публикаций</Text>
      </View>

      {posts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="camera-outline" size={80} color="#dbdbdb" />
          <Text style={styles.emptyTitle}>Публикаций пока нет</Text>
          <Text style={styles.emptyText}>
            Создайте первый пост, чтобы он появился здесь
          </Text>
        </View>
      ) : viewMode === 'grid' ? (
        // Сетка (3 колонки)
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderGridItem}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
        />
      ) : (
        // Список
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  title: { 
    fontSize: 20, 
    fontWeight: "bold",
    color: "#262626"
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stats: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#262626',
  },
  statLabel: {
    fontSize: 14,
    color: '#8e8e8e',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8e8e8e",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#8e8e8e",
    textAlign: "center",
    lineHeight: 20,
  },
  // Стили для сетки
  gridContainer: {
    padding: 1,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    margin: 0.5,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fafafa',
  },
  textOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 4,
  },
  // Стили для списка
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  listUsername: {
    fontWeight: '600',
    color: '#262626',
    fontSize: 16,
    marginBottom: 4,
  },
  listText: {
    color: '#262626',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  listTime: {
    fontSize: 12,
    color: '#8e8e8e',
  },
});