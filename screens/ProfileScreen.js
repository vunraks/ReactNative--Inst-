import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      
      if (snap.exists()) {
        setProfile(snap.data());
      }
    };
    
    fetchProfile();
  }, []);

  // Загрузка постов пользователя
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "posts"), 
      where("userId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserPosts(posts);
    });

    return unsubscribe;
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Выход",
      "Вы уверены, что хотите выйти?",
      [
        {
          text: "Отмена",
          style: "cancel"
        },
        {
          text: "Выйти",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              Alert.alert("Ошибка", "Не удалось выйти: " + error.message);
            }
          }
        }
      ]
    );
  };

  const renderPostGrid = () => (
    <View style={styles.postsGrid}>
      {userPosts.map((post) => (
        <TouchableOpacity 
          key={post.id} 
          style={styles.postThumbnail}
          onPress={() => navigation.navigate("PostDetail", { post })}
        >
          {post.imageUrl ? (
            <Image source={{ uri: post.imageUrl }} style={styles.thumbnailImage} />
          ) : (
            <View style={styles.textPostThumbnail}>
              <Text style={styles.textPostPreview} numberOfLines={3}>
                {post.text}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
      {userPosts.length === 0 && (
        <View style={styles.noPosts}>
          <Ionicons name="camera-outline" size={64} color="#dbdbdb" />
          <Text style={styles.noPostsText}>Публикаций пока нет</Text>
          <TouchableOpacity 
            style={styles.firstPostBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.firstPostText}>Создать первую публикацию</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderTaggedPosts = () => (
    <View style={styles.noContent}>
      <Ionicons name="person-outline" size={64} color="#dbdbdb" />
      <Text style={styles.noContentText}>Отметок пока нет</Text>
    </View>
  );

  const renderSavedPosts = () => (
    <View style={styles.noContent}>
      <Ionicons name="bookmark-outline" size={64} color="#dbdbdb" />
      <Text style={styles.noContentText}>Сохраненных публикаций пока нет</Text>
    </View>
  );

  const renderSettingsModal = () => (
    <View style={styles.settingsModal}>
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>Настройки</Text>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="notifications-outline" size={24} color="#262626" />
          <Text style={styles.settingsText}>Уведомления</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#262626" />
          <Text style={styles.settingsText}>Конфиденциальность</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="help-circle-outline" size={24} color="#262626" />
          <Text style={styles.settingsText}>Помощь</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="information-circle-outline" size={24} color="#262626" />
          <Text style={styles.settingsText}>О приложении</Text>
        </TouchableOpacity>

        <View style={styles.settingsDivider} />

        <TouchableOpacity 
          style={[styles.settingsItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ED4956" />
          <Text style={[styles.settingsText, styles.logoutText]}>Выйти</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.closeSettings}
          onPress={() => setShowSettings(false)}
        >
          <Text style={styles.closeSettingsText}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0095F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>@{profile.username}</Text>
          <Ionicons name="chevron-down" size={16} color="#262626" />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="add-circle-outline" size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="menu-outline" size={24} color="#262626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profile.profilePicture }}
                style={styles.avatar}
              />
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>публикаций</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{profile.followers || 0}</Text>
                <Text style={styles.statLabel}>подписчиков</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{profile.following || 0}</Text>
                <Text style={styles.statLabel}>подписок</Text>
              </View>
            </View>
          </View>

          {/* Profile Details */}
          <View style={styles.profileDetails}>
            <Text style={styles.displayName}>{profile.displayName}</Text>
            <Text style={styles.bio}>{profile.bio || "Расскажите о себе"}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editProfileBtn} 
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text style={styles.editProfileText}>Редактировать профиль</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareProfileBtn}>
              <Ionicons name="person-add-outline" size={16} color="#262626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stories Highlights */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.storiesSection}
        >
          <TouchableOpacity style={styles.storyHighlight}>
            <View style={styles.newHighlight}>
              <Ionicons name="add" size={24} color="#262626" />
            </View>
            <Text style={styles.highlightLabel}>Новое</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "posts" && styles.activeTab]}
            onPress={() => setActiveTab("posts")}
          >
            <Ionicons 
              name="grid" 
              size={24} 
              color={activeTab === "posts" ? "#0095F6" : "#8e8e8e"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === "saved" && styles.activeTab]}
            onPress={() => setActiveTab("saved")}
          >
            <Ionicons 
              name="bookmark-outline" 
              size={24} 
              color={activeTab === "saved" ? "#0095F6" : "#8e8e8e"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === "tagged" && styles.activeTab]}
            onPress={() => setActiveTab("tagged")}
          >
            <Ionicons 
              name="person" 
              size={24} 
              color={activeTab === "tagged" ? "#0095F6" : "#8e8e8e"} 
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === "posts" && renderPostGrid()}
        {activeTab === "saved" && renderSavedPosts()}
        {activeTab === "tagged" && renderTaggedPosts()}
      </ScrollView>

      {/* Модальное окно настроек */}
      {showSettings && renderSettingsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DBDBDB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 5,
  },
  headerRight: {
    flexDirection: "row",
  },
  headerIcon: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 15,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 20,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: "#E1306C",
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
  },
  statLabel: {
    fontSize: 14,
    color: "#8e8e8e",
  },
  profileDetails: {
    marginBottom: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 2,
  },
  bio: {
    fontSize: 14,
    color: "#262626",
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    marginBottom: 8,
  },
  editProfileBtn: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#dbdbdb",
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  shareProfileBtn: {
    width: 40,
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  storiesSection: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#dbdbdb",
  },
  storyHighlight: {
    alignItems: "center",
    marginRight: 15,
  },
  newHighlight: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#dbdbdb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  highlightLabel: {
    fontSize: 12,
    color: "#262626",
  },
  tabsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#dbdbdb",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "transparent",
  },
  activeTab: {
    borderTopColor: "#262626",
  },
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  postThumbnail: {
    width: (screenWidth - 2) / 3,
    height: (screenWidth - 2) / 3,
    margin: 0.5,
    backgroundColor: "#fafafa",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  textPostThumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#dbdbdb",
  },
  textPostPreview: {
    fontSize: 12,
    color: "#8e8e8e",
    textAlign: "center",
  },
  noPosts: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  noPostsText: {
    marginTop: 10,
    color: "#8e8e8e",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  firstPostBtn: {
    backgroundColor: "#0095F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  firstPostText: {
    color: "white",
    fontWeight: "600",
  },
  noContent: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 50,
  },
  noContentText: {
    marginTop: 10,
    color: "#8e8e8e",
    fontSize: 16,
    textAlign: "center",
  },
  settingsModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  settingsContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingsText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#262626",
  },
  settingsDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#ED4956",
  },
  closeSettings: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  closeSettingsText: {
    color: "#0095F6",
    fontSize: 16,
    fontWeight: "600",
  },
});