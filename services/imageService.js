import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const imageService = {
  // Запрос разрешений для камеры
  async requestCameraPermissions() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  },

  // Сделать фото
  async takePhoto() {
    const hasPermission = await this.requestCameraPermissions();
    if (!hasPermission) {
      Alert.alert("Ошибка", "Разрешите доступ к камере");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    return result.canceled ? null : result.assets[0].uri;
  },

  // Выбрать из галереи
  async pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    return result.canceled ? null : result.assets[0].uri;
  },
};