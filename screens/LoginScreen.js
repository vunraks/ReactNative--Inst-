import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
  const [isSignUp, setIsSignUp] = useState(false); // Переключатель между входом и регистрацией

  const showError = (msg) => {
    setError(msg);
    setVisible(true);
  };

  // Регистрация
  const handleSignUp = async () => {
    if (!email.includes("@")) return showError("Введите корректный email");
    if (password.length < 6) return showError("Пароль должен быть минимум 6 символов");

    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        email,
        displayName: email.split('@')[0], // Автоматическое имя пользователя
        username: email.split('@')[0],
        bio: "",
        profilePicture: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
        postsCount: 0,
        followers: 0,
        following: 0,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Вход
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

  // Обработчик основной кнопки
  const handleSubmit = () => {
    if (isSignUp) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            {/* Заголовок */}
            <Text variant="headlineMedium" style={styles.title}>
              Instugram
            </Text>
            
            <Text variant="bodyMedium" style={styles.subtitle}>
              {isSignUp ? "Зарегистрируйтесь, чтобы начать" : "Войдите в свой аккаунт"}
            </Text>

            {/* Поля ввода */}
            <TextInput
              label="Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Пароль"
              mode="outlined"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              autoComplete="password"
              left={<TextInput.Icon icon="lock" />}
            />

            {/* Основная кнопка */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.mainButton}
              loading={loading}
              disabled={loading || !email || !password}
              icon={isSignUp ? "account-plus" : "login"}
            >
              {isSignUp ? "Зарегистрироваться" : "Войти"}
            </Button>

            {/* Переключатель между входом и регистрацией */}
            <View style={styles.switchContainer}>
              <Text variant="bodyMedium" style={styles.switchText}>
                {isSignUp ? "Уже есть аккаунт?" : "Еще нет аккаунта?"}
              </Text>
              <Button
                mode="text"
                onPress={() => setIsSignUp(!isSignUp)}
                compact
                style={styles.switchButton}
              >
                {isSignUp ? "Войти" : "Зарегистрироваться"}
              </Button>
            </View>

            {/* Разделитель */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="bodySmall" style={styles.dividerText}>ИЛИ</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Быстрый вход для тестирования (можно удалить в продакшене) */}
            <Button
              mode="outlined"
              onPress={() => {
                setEmail("qwerty@gmail.com");
                setPassword("123456");
              }}
              style={styles.demoButton}
              icon="rocket-launch"
            >
              Быстрый вход (qwerty)
            </Button>
          </Card.Content>
        </Card>

        {/* Информация о приложении */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Приложение создано с использованием React Native и Firebase
          </Text>
        </View>
      </ScrollView>

      {/* Уведомления об ошибках */}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={4000}
        action={{
          label: 'OK',
          onPress: () => setVisible(false),
        }}
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
    fontSize: 32,
    color: "#E1306C", // Instagram-like color
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  input: {
    marginBottom: 16,
  },
  mainButton: {
    marginVertical: 8,
    paddingVertical: 6,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  switchText: {
    color: "#666",
  },
  switchButton: {
    marginLeft: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#dbdbdb",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
    fontWeight: "600",
  },
  demoButton: {
    marginVertical: 8,
  },
  footer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    textAlign: "center",
    color: "#666",
    lineHeight: 18,
  },
});