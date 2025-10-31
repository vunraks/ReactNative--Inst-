import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list = await Promise.all(
        snapshot.docs.map(async (d) => {
          const postData = d.data();
          const likesSnap = await getDoc(
            doc(db, "posts", d.id, "likes", auth.currentUser.uid)
          );
          return {
            id: d.id,
            ...postData,
            likedByUser: likesSnap.exists(),
          };
        })
      );
      setPosts(list);
    });
    return unsubscribe;
  }, []);

  // Загрузка фото из галереи
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  // Сделать фото с камеры
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Ошибка", "Разрешите доступ к камере");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  // Загрузка на Cloudinary и добавление поста
  const uploadPhotoPost = async () => {
    if (!photo) return;
    setUploading(true);

    const data = new FormData();
    data.append("file", {
      uri: photo,
      type: "image/jpeg",
      name: "photo.jpg",
    });
    data.append("upload_preset", "unsigned_preset");
    data.append("cloud_name", "dsdc5dyol");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dsdc5dyol/image/upload",
        data
      );
      const imageUrl = res.data.secure_url;

      await addDoc(collection(db, "posts"), {
        text: newPost || "",
        imageUrl,
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });

      setNewPost("");
      setPhoto(null);
    } catch (err) {
      console.log("❌ Ошибка загрузки:", err);
      Alert.alert("Ошибка", "Не удалось загрузить фото.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddPost = async () => {
    if (!newPost.trim() && !photo) return;

    if (photo) {
      await uploadPhotoPost();
    } else {
      // обычный текстовый пост
      setUploading(true);
      try {
        await addDoc(collection(db, "posts"), {
          text: newPost,
          userId: auth.currentUser.uid,
          email: auth.currentUser.email,
          createdAt: serverTimestamp(),
        });
        setNewPost("");
      } catch (err) {
        console.log("❌ Ошибка при добавлении поста:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUpdate = async () => {
    if (!newPost.trim() || !editingPost) return;
    await updateDoc(doc(db, "posts", editingPost.id), {
      text: newPost,
      updatedAt: serverTimestamp(),
    });
    setEditingPost(null);
    setNewPost("");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "posts", id));
  };

  const startEditing = (post) => {
    setEditingPost(post);
    setNewPost(post.text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}></Text>

      <View style={styles.newPostBox}>
        <TextInput
          style={styles.input}
          placeholder="Что нового?"
          placeholderTextColor="#777"
          value={newPost}
          onChangeText={setNewPost}
        />

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
            <Text style={styles.iconText}>🖼 Загрузить Фото</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={takePhoto}>
            <Text style={styles.iconText}>📷 Камера</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.postBtn, editingPost && styles.saveBtn]}
            onPress={editingPost ? handleUpdate : handleAddPost}
            disabled={uploading}
          >
            <Text style={styles.postBtnText}>
              {uploading ? "⏳" : editingPost ? "Сохранить" : "Опубликовать"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {photo && <Image source={{ uri: photo }} style={styles.previewImage} />}
      {uploading && <ActivityIndicator size="large" color="#2563EB" />}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUser={auth.currentUser}
            onDelete={handleDelete}
            onEdit={startEditing}
          />
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.footerText}>👤 Профиль</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerBtn, { backgroundColor: "#ef4444" }]}
          onPress={() => signOut(auth)}
        >
          <Text style={styles.footerText}>🚪 Выйти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ----- PostCard остался прежним -----
function PostCard({ post, currentUser, onDelete, onEdit }) {
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(post.likedByUser || false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "posts", post.id, "likes"),
      (snap) => {
        setLikesCount(snap.size);
        setLiked(snap.docs.some((d) => d.id === currentUser.uid));
      }
    );
    return unsub;
  }, []);

  const toggleLike = async () => {
    const likeRef = doc(db, "posts", post.id, "likes", currentUser.uid);
    const likeSnap = await getDoc(likeRef);
    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, {
        userId: currentUser.uid,
        email: currentUser.email,
        createdAt: serverTimestamp(),
      });
    }
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.author}>{post.email}</Text>
      </View>

      <Text style={styles.postText}>{post.text}</Text>
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
      )}

      <View style={styles.postFooter}>
        <TouchableOpacity onPress={toggleLike}>
          <Text
            style={[
              styles.likeText,
              liked && { color: "#2563EB", fontWeight: "700" },
            ]}
          >
            {liked ? "♥" : "♡"} {likesCount}
          </Text>
        </TouchableOpacity>

        {post.userId === currentUser.uid && (
          <View style={styles.editRow}>
            <TouchableOpacity onPress={() => onEdit(post)}>
              <Text style={styles.editBtn}>Ред.</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(post.id)}>
              <Text style={styles.deleteBtn}>Удалить</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ----- Стили -----
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa", padding: 12 },
  newPostBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    marginBottom: 8,
  },
  actionsRow: { flexDirection: "row", justifyContent: "space-between" },
  iconBtn: {
    backgroundColor: "#E5E7EB",
    padding: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  iconText: { fontSize: 16 },
  postBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  saveBtn: { backgroundColor: "#16A34A" },
  postBtnText: { color: "white", fontWeight: "700" },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  postCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  author: { fontWeight: "600", color: "#374151" },
  postText: { fontSize: 15, color: "#111827", marginBottom: 6 },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeText: { color: "#6B7280", fontSize: 15 },
  editRow: { flexDirection: "row", gap: 10 },
  editBtn: { color: "#2563EB" },
  deleteBtn: { color: "#DC2626" },
  footer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    backgroundColor: "#1E3A8A",
    paddingVertical: 16,
    borderRadius: 132,
    alignItems: "center",
  },
  footerText: { color: "white", fontWeight: "700" },
});
