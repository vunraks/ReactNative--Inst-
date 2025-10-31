// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ добавляем Storage

// Твоя конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBDR3PPtzYGu2YM9CelB_1yfZfA-ItG0qk",
  authDomain: "qwerty-f5295.firebaseapp.com",
  projectId: "qwerty-f5295",
  storageBucket: "qwerty-f5295.appspot.com", // ✅ исправлено (.app → .appspot.com)
  messagingSenderId: "869345659855",
  appId: "1:869345659855:web:e32eb63a62a429f5caa0ba",
  measurementId: "G-Q7PDM3GMYJ",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// ✅ Настраиваем Auth с AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Firestore
const db = getFirestore(app);

// ✅ Storage
const storage = getStorage(app);

// Экспорт
export { auth, db, storage };
