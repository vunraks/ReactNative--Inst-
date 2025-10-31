import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function CameraScreen() {
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(null);
  const navigation = useNavigation();

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Ошибка", "Разрешите доступ к камере");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.log("❌ Ошибка камеры:", error);
      Alert.alert("Ошибка", "Не удалось открыть камеру.");
    }
  };

  const uploadToCloudinary = async () => {
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
      setUrl(imageUrl);
      console.log("✅ Cloudinary:", imageUrl);

      await addDoc(collection(db, "posts"), {
        imageUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert("✅ Успех", "Фото добавлено в посты!");
      setPhoto(null);
      setUrl(null);
      navigation.navigate("Home");
    } catch (err) {
      console.log("❌ Ошибка загрузки:", err);
      Alert.alert("Ошибка", "Не удалось загрузить фото.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Создать пост 📸</Text>

        {photo ? (
          <>
            <Image source={{ uri: photo }} style={styles.preview} />
            <TouchableOpacity
              style={[styles.button, styles.uploadButton]}
              onPress={uploadToCloudinary}
            >
              <Text style={styles.buttonText}>⬆️ Опубликовать</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.takeButton]}
            onPress={takePhoto}
          >
            <Text style={styles.buttonText}>📷 Сделать фото</Text>
          </TouchableOpacity>
        )}

        {uploading && (
          <ActivityIndicator size="large" color="#FF4500" style={{ marginTop: 20 }} />
        )}
        {url && (
          <Text selectable style={styles.link}>
            ✅ Фото загружено: {url}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1B",
    marginBottom: 20,
    textAlign: "center",
  },
  preview: {
    width: "100%",
    height: 400,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  takeButton: {
    backgroundColor: "#FF4500", // Reddit-оранжевый
  },
  uploadButton: {
    backgroundColor: "#0079D3", // Reddit-синий
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 15,
    textAlign: "center",
    color: "#22C55E",
    fontSize: 12,
  },
});
