import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import CameraScreen from "./screens/CameraScreen";
import ReelsScreen from "./screens/ReelsScreen";
import { UserProvider } from "./contexts/UserContext"; // Добавьте этот импорт

const Stack = createStackNavigator();

// Instagram-подобная тема
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#3897f0",    // синий Instagram
    background: "#fff",
    card: "#fff",
    text: "#111",
    border: "#ddd",
    notification: "#ff453a", // красный уведомлений
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) return null;

  return (
    <UserProvider> {/* Оберните все в UserProvider */}
      <PaperProvider>
        <NavigationContainer theme={AppTheme}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { 
                backgroundColor: AppTheme.colors.card,
                elevation: 0, // Убираем тень на Android
                shadowOpacity: 0, // Убираем тень на iOS
                borderBottomWidth: 1,
                borderBottomColor: "#dbdbdb"
              },
              headerTintColor: AppTheme.colors.text,
              headerTitleStyle: { 
                fontWeight: "600",
                fontSize: 17
              },
              headerBackTitle: "Назад", // Для iOS
            }}
          >
            {user ? (
              <>
                <Stack.Screen 
                  name="Home" 
                  component={HomeScreen} 
                  options={{ 
                    title: "Instagram",
                    headerTitleStyle: {
                      fontSize: 28,
                      marginBottom: 4,
                      fontWeight: "700",
                    }
                  }} 
                />
                <Stack.Screen 
                  name="Profile" 
                  component={ProfileScreen} 
                  options={{ 
                    title: "Профиль",
                    headerBackTitle: " " // Пустой текст для кнопки назад
                  }} 
                />
                <Stack.Screen 
                  name="EditProfile" 
                  component={EditProfileScreen} 
                  options={{ 
                    title: "Редактировать профиль",
                    headerBackTitle: " " // Пустой текст для кнопки назад
                  }} 
                />
                <Stack.Screen 
                  name="Camera" 
                  component={CameraScreen} 
                  options={{ 
                    title: "Камера",
                    headerBackTitle: " " // Пустой текст для кнопки назад
                  }} 
                />
                <Stack.Screen 
                  name="Reels" 
                  component={ReelsScreen} 
                  options={{ 
                    headerShown: false // Скрываем хедер для полноэкранного вида Reels
                  }} 
                />
              </>
            ) : (
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }} 
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </UserProvider>
  );
}