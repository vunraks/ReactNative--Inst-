import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const ensureUserDoc = async (user) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: "",
      bio: "",
      createdAt: serverTimestamp(),
    });
  }
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      await ensureUserDoc(user);
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setDisplayName(data.displayName || "");
        setBio(data.bio || "");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const ref = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        ref,
        {
          displayName,
          bio,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setMsg("✅ Профиль обновлён");
    } catch (e) {
      setMsg("Ошибка: " + e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri:
              "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.email}>{auth.currentUser?.email}</Text>
        <Text style={styles.uid}>UID: {auth.currentUser?.uid}</Text>

        <TextInput
          style={styles.input}
          placeholder="Имя пользователя"
          placeholderTextColor="#999"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="О себе"
          placeholderTextColor="#999"
          value={bio}
          onChangeText={setBio}
          multiline
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>💾 Сохранить</Text>
        </TouchableOpacity>

        <TouchableOpacity

        >
        </TouchableOpacity>

        {msg ? <Text style={styles.msg}>{msg}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  email: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
  uid: { fontSize: 12, color: "#6b7280", marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    marginBottom: 12,
    color: "#111",
  },
  textarea: { height: 80, textAlignVertical: "top" },
  saveBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  saveText: { color: "white", fontWeight: "700", fontSize: 16 },
  cameraBtn: {
    borderWidth: 1,
    borderColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  cameraText: { color: "#2563EB", fontWeight: "700", fontSize: 16 },
  msg: { marginTop: 10, color: "green", fontWeight: "500" },
});
