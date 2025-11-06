import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CreatePostStep1 = ({ onTakePhoto, onPickImage, onSetCreatePostStep }) => {
  return (
    <TouchableWithoutFeedback>
      <View style={styles.step1Container}>
        <Text style={styles.stepTitle}>Создать новую публикацию</Text>

        <TouchableOpacity style={styles.optionButton} onPress={onTakePhoto}>
          <Ionicons name="camera" size={32} color="#262626" />
          <Text style={styles.optionText}>Сделать фото</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={onPickImage}>
          <Ionicons name="image" size={32} color="#262626" />
          <Text style={styles.optionText}>Выбрать из галереи</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => onSetCreatePostStep(2)}
        >
          <Ionicons name="document-text" size={32} color="#262626" />
          <Text style={styles.optionText}>Только текст</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  step1Container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 40,
    textAlign: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 10,
    marginBottom: 15,
  },
  optionText: {
    fontSize: 18,
    marginLeft: 15,
    fontWeight: "500",
  },
});

export default CreatePostStep1;