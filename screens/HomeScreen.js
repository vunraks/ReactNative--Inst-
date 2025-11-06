import React, { useEffect, useState, useRef } from "react";
import {
  View,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  StyleSheet,
  Alert,
  Keyboard,
  ActionSheetIOS,
  FlatList,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import StoriesSection from "../components/StoriesSection";
import PostsList from "../components/PostsList";
import CreatePostModal from "../components/CreatePostModal";
import EditPostModal from "../components/EditPostModal";
import CommentsModal from "../components/CommentsModal";
import BottomNavigation from "../components/BottomNavigation";
import { postService } from "../services/postService";
import { imageService } from "../services/imageService";
import { usePosts } from "../hooks/usePosts";
import { useUser } from "../contexts/UserContext"; // Добавьте этот импорт

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function HomeScreen({ navigation }) {
  const { posts, loading } = usePosts();
  const { userProfile } = useUser(); // Получаем userProfile из контекста
  const [newPost, setNewPost] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [stories, setStories] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [createPostStep, setCreatePostStep] = useState(1);
  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [postComments, setPostComments] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editPostText, setEditPostText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const storiesTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -150],
    extrapolate: "clamp",
  });

  const storiesOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const userAvatar =
      userProfile?.avatar ||
      auth.currentUser?.photoURL ||
      "https://cdn-icons-png.flaticon.com/512/847/847969.png";
    const mockStories = [
      {
        id: "1",
        username: "Ваша история",
        isUser: true,
        avatar: userAvatar,
        hasNew: true,
      },
      {
        id: "2",
        username: "Exile",
        avatar:
          "https://instagram.fala6-1.fna.fbcdn.net/v/t51.2885-19/440745264_391177430557268_7436930931401630794_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fala6-1.fna.fbcdn.net&_nc_cat=1&_nc_oc=Q6cZ2QGZNvQyLoxBrJSMppHk8UtPHOJfLT7Af4eUIZ-QxJQbRRPeAg_V5x3P7cACBrovSRs&_nc_ohc=1HLYLQp88-4Q7kNvwFH8Y5V&_nc_gid=gFxOWyUV1uNdbukF752LOg&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfgnkT9c4VbFutSJCPz2CG4FT5RcxKDy8Y8-mTpyUfG_Rw&oe=69128BD1&_nc_sid=8b3546",
        hasNew: true,
      },
      {
        id: "3",
        username: "bulkinspb",
        avatar:
          "https://instagram.fala6-1.fna.fbcdn.net/v/t51.2885-19/11190268_815531978496182_215548994_a.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xNTAuYzIifQ&_nc_ht=instagram.fala6-1.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QFnsoU5cmpLOjNMoKycyMlkzAmt3FWdo8K2tD505LHreeYpPowUozVi2Z2WLS2kPt4&_nc_ohc=EAmwYVRwLbsQ7kNvwFGG5pS&_nc_gid=kUBEfeoKWpRw-JXQhIGqIQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Afh4FocA3xTy1ZRc-jVBUQAtJmOFjppg-nlloZ3NfoCR4Q&oe=6912B159&_nc_sid=7a9f4b",
        hasNew: true,
      },
      {
        id: "4",
        username: "br4tishkin",
        avatar:
          "https://instagram.fala6-1.fna.fbcdn.net/v/t51.2885-19/327817330_181558264506348_8483960341330770189_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fala6-1.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QGsQtPIBYpxSKGHgbY7mRcfIwbK7JhBO45Rq-n-KFRfdkT_dov9PAB9B4TRcMh3fEg&_nc_ohc=q5bdjEFW62IQ7kNvwHZWbGB&_nc_gid=ZmfIpIiUdimjlxA1v0hREA&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Afiwx4NOInlDR2SENqRmK31y7fx7FTvVSD-SdBTjffrt2Q&oe=6912889B&_nc_sid=7a9f4b",
        hasNew: false,
      },
      {
        id: "5",
        username: "6ix9ine",
        avatar:
          "https://instagram.fala6-1.fna.fbcdn.net/v/t51.2885-19/565433199_18580127815048874_6221321918679066753_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42NDAuYzIifQ&_nc_ht=instagram.fala6-1.fna.fbcdn.net&_nc_cat=1&_nc_oc=Q6cZ2QHmeE35r6ZeGLTqjk4m-fMUlt1dVhUAd9lGTDQgnRNyWj60jicVRaJejPNgSA--GO4&_nc_ohc=4OIZJzwJfO0Q7kNvwH_2lFx&_nc_gid=Nr8vLBwEJArM3EwSdKH2uw&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfgvygyptyrWiAqbnyUNWhFU0gTtRzEpZfUnijwta9gngw&oe=69129C98&_nc_sid=7a9f4b",
        hasNew: true,

      },
    ];
    setStories(mockStories);
  }, [userProfile]); // Добавляем userProfile в зависимости

  const pickImage = async () => {
    try {
      const uri = await imageService.pickImage();
      if (uri) {
        setPhoto(uri);
        setCreatePostStep(2);
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось выбрать фото");
    }
  };

  const takePhoto = async () => {
    try {
      const uri = await imageService.takePhoto();
      if (uri) {
        setPhoto(uri);
        setCreatePostStep(2);
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось сделать фото");
    }
  };

  const handlePublish = async () => {
    if (!newPost.trim() && !photo) {
      Alert.alert("Ошибка", "Добавьте текст или фото");
      return;
    }

    setUploading(true);
    try {
      if (photo) {
        await postService.createPhotoPost(newPost, photo, userProfile); // Передаем userProfile
      } else {
        await postService.createTextPost(newPost, userProfile); // Передаем userProfile
      }

      setNewPost("");
      setPhoto(null);
      setShowCreatePost(false);
      setCreatePostStep(1);
      Alert.alert("Успех", "Пост опубликован!");
    } catch (err) {
      console.log("❌ Ошибка публикации:", err);
      Alert.alert("Ошибка", "Не удалось опубликовать пост");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    Alert.alert("Удалить пост", "Вы уверены, что хотите удалить этот пост?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            await postService.deletePost(postId);
            Alert.alert("Успех", "Пост удален");
          } catch (error) {
            console.log("❌ Ошибка удаления поста:", error);
            Alert.alert("Ошибка", "Не удалось удалить пост");
          }
        },
      },
    ]);
  };

  const handleEditPost = async () => {
    if (!editPostText.trim()) {
      Alert.alert("Ошибка", "Введите текст поста");
      return;
    }

    setUploading(true);
    try {
      await postService.updatePost(editingPost.id, editPostText);
      setShowEditModal(false);
      setEditingPost(null);
      setEditPostText("");
      Alert.alert("Успех", "Пост обновлен!");
    } catch (error) {
      console.log("❌ Ошибка редактирования поста:", error);
      Alert.alert("Ошибка", "Не удалось обновить пост");
    } finally {
      setUploading(false);
    }
  };

  const showPostActions = (post) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Отмена", "Удалить", "Редактировать"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleDeletePost(post.id);
          } else if (buttonIndex === 2) {
            setEditingPost(post);
            setEditPostText(post.text || "");
            setShowEditModal(true);
          }
        }
      );
    } else {
      Alert.alert("Действия с постом", "Выберите действие", [
        { text: "Отмена", style: "cancel" },
        {
          text: "Редактировать",
          onPress: () => {
            setEditingPost(post);
            setEditPostText(post.text || "");
            setShowEditModal(true);
          },
        },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => handleDeletePost(post.id),
        },
      ]);
    }
  };

  const addComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: commentText.trim(),
        userId: auth.currentUser.uid,
        username:
          auth.currentUser.displayName || auth.currentUser.email.split("@")[0],
        userAvatar:
          auth.currentUser.photoURL ||
          "https://cdn-icons-png.flaticon.com/512/847/847969.png",
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch (error) {
      console.log("❌ Ошибка добавления комментария:", error);
      Alert.alert("Ошибка", "Не удалось добавить комментарий");
    }
  };

  const loadComments = async (postId) => {
    try {
      const commentsQuery = query(
        collection(db, "posts", postId, "comments"),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPostComments((prev) => ({
          ...prev,
          [postId]: comments,
        }));
      });

      return unsubscribe;
    } catch (error) {
      console.log("❌ Ошибка загрузки комментариев:", error);
    }
  };

  const openComments = (postId) => {
    setShowComments(postId);
    loadComments(postId);
  };

  const closeComments = () => {
    setShowComments(null);
    setCommentText("");
  };

  const cancelCreatePost = () => {
    setShowCreatePost(false);
    setPhoto(null);
    setNewPost("");
    setCreatePostStep(1);
    Keyboard.dismiss();
  };

  const cancelEditPost = () => {
    setShowEditModal(false);
    setEditingPost(null);
    setEditPostText("");
    Keyboard.dismiss();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <StoriesSection
        stories={stories}
        storiesTranslateY={storiesTranslateY}
        storiesOpacity={storiesOpacity}
      />

      <PostsList
        posts={posts}
        scrollY={scrollY}
        flatListRef={flatListRef}
        onOpenComments={openComments}
        onShowPostActions={showPostActions}
        onShowCreatePost={() => setShowCreatePost(true)}
      />

      <CreatePostModal
        visible={showCreatePost}
        createPostStep={createPostStep}
        newPost={newPost}
        photo={photo}
        uploading={uploading}
        onCancel={cancelCreatePost}
        onSetCreatePostStep={setCreatePostStep}
        onSetNewPost={setNewPost}
        onSetPhoto={setPhoto}
        onPublish={handlePublish}
        onPickImage={pickImage}
        onTakePhoto={takePhoto}
      />

      <EditPostModal
        visible={showEditModal}
        editingPost={editingPost}
        editPostText={editPostText}
        uploading={uploading}
        onCancel={cancelEditPost}
        onSetEditPostText={setEditPostText}
        onEditPost={handleEditPost}
      />

      <CommentsModal
        visible={!!showComments}
        post={posts.find((p) => p.id === showComments)}
        comments={postComments[showComments] || []}
        commentText={commentText}
        onClose={closeComments}
        onSetCommentText={setCommentText}
        onAddComment={() => addComment(showComments)}
      />

      <BottomNavigation
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        onShowCreatePost={() => setShowCreatePost(true)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
