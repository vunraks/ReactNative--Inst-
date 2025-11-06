import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setDisplayName(data.displayName || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
      }
    };
    
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!username.trim()) {
      setMsg("❌ Имя пользователя обязательно");
      return;
    }

    setSaving(true);
    try {
      const ref = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        ref,
        {
          displayName: displayName.trim(),
          username: username.trim().toLowerCase(),
          bio: bio.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setMsg("✅ Профиль обновлён");
      setTimeout(() => {
        setMsg("");
        navigation.goBack();
      }, 1500);
    } catch (e) {
      setMsg("❌ Ошибка: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const pickProfilePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLoading(true);
      try {
        const data = new FormData();
        data.append("file", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "profile.jpg",
        });
        data.append("upload_preset", "unsigned_preset");
        data.append("cloud_name", "dsdc5dyol");

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dsdc5dyol/image/upload",
          data
        );
        
        const imageUrl = res.data.secure_url;
        const ref = doc(db, "users", auth.currentUser.uid);
        await setDoc(ref, {
          profilePicture: imageUrl,
          updatedAt: serverTimestamp(),
        }, { merge: true });

        setProfile(prev => ({ ...prev, profilePicture: imageUrl }));
        setMsg("✅ Фото профиля обновлено");
        setTimeout(() => setMsg(""), 3000);
      } catch (err) {
        setMsg("❌ Ошибка загрузки фото");
      } finally {
        setLoading(false);
      }
    }
  };

  const takeProfilePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Ошибка", "Разрешите доступ к камере");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLoading(true);
      try {
        const data = new FormData();
        data.append("file", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "profile.jpg",
        });
        data.append("upload_preset", "unsigned_preset");
        data.append("cloud_name", "dsdc5dyol");

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dsdc5dyol/image/upload",
          data
        );
        
        const imageUrl = res.data.secure_url;
        const ref = doc(db, "users", auth.currentUser.uid);
        await setDoc(ref, {
          profilePicture: imageUrl,
          updatedAt: serverTimestamp(),
        }, { merge: true });

        setProfile(prev => ({ ...prev, profilePicture: imageUrl }));
        setMsg("✅ Фото профиля обновлено");
        setTimeout(() => setMsg(""), 3000);
      } catch (err) {
        setMsg("❌ Ошибка загрузки фото");
      } finally {
        setLoading(false);
      }
    }
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редактировать профиль</Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#0095F6" />
          ) : (
            <Text style={styles.headerSave}>Готово</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profile.profilePicture }}
              style={styles.avatar}
            />
            {loading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
          </View>
          
          <View style={styles.photoButtons}>
            <TouchableOpacity 
              style={styles.photoBtn}
              onPress={pickProfilePicture}
              disabled={loading}
            >
              <Text style={styles.photoBtnText}>Изменить фото профиля</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cameraBtn}
              onPress={takeProfilePicture}
              disabled={loading}
            >
              <Ionicons name="camera" size={20} color="#0095F6" />
              <Text style={styles.cameraBtnText}>Сделать фото</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Edit Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={styles.input}
              placeholder="Ваше имя"
              placeholderTextColor="#999"
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Имя пользователя</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Биография</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Расскажите о себе"
              placeholderTextColor="#999"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              maxLength={150}
            />
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>

          {/* Сообщения */}
          {msg ? (
            <View style={[
              styles.message, 
              msg.includes('❌') ? styles.errorMessage : styles.successMessage
            ]}>
              <Text style={styles.messageText}>{msg}</Text>
            </View>
          ) : null}
        </View>

        {/* Additional Options */}
        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>Переключиться на профессиональный аккаунт</Text>
            <Ionicons name="chevron-forward" size={20} color="#8e8e8e" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerSave: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0095F6",
  },
  scrollView: {
    flex: 1,
  },
  photoSection: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#dbdbdb",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#E1306C",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  photoButtons: {
    width: "100%",
  },
  photoBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#0095F6",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  photoBtnText: {
    color: "#0095F6",
    fontWeight: "600",
  },
  cameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#dbdbdb",
    paddingVertical: 10,
    borderRadius: 8,
  },
  cameraBtnText: {
    marginLeft: 5,
    color: "#0095F6",
    fontWeight: "500",
  },
  form: {
    padding: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#262626",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#8e8e8e",
    marginTop: 5,
  },
  message: {
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  successMessage: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
    borderWidth: 1,
  },
  errorMessage: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
    borderWidth: 1,
  },
  messageText: {
    textAlign: "center",
    fontWeight: "500",
  },
  optionsSection: {
    borderTopWidth: 1,
    borderTopColor: "#dbdbdb",
    padding: 15,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 16,
    color: "#262626",
  },
});