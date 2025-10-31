import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CameraScreen from "./screens/CameraScreen";

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
    <PaperProvider>
      <NavigationContainer theme={AppTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: AppTheme.colors.card },
            headerTintColor: AppTheme.colors.text,
            headerTitleStyle: { fontWeight: "600" },
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Лента" }} />
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Профиль" }} />
              <Stack.Screen name="Camera" component={CameraScreen} options={{ title: "Камера" }} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
