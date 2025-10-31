import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, useTheme, Snackbar, Card } from "react-native-paper";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const showError = (msg) => {
    setError(msg);
    setVisible(true);
  };

  // регистрация
  const handleSignUp = async () => {
    if (!email.includes("@")) return showError("Введите корректный email");
    if (password.length < 6) return showError("Пароль должен быть минимум 6 символов");

    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        email,
        displayName: "",
        bio: "",
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // вход
  const handleSignIn = async () => {
    if (!email.includes("@")) return showError("Введите корректный email");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Вход / Регистрация
          </Text>

          <TextInput
            label="Email"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            label="Пароль"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSignIn}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Войти
          </Button>

          <Button
            mode="outlined"
            onPress={handleSignUp}
            style={styles.button}
            disabled={loading}
          >
            Зарегистрироваться
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={{ backgroundColor: colors.error }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    paddingVertical: 10,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginVertical: 6,
  },
});
