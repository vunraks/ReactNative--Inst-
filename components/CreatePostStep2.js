import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CreatePostStep2 = ({
  newPost,
  photo,
  uploading,
  onSetNewPost,
  onSetPhoto,
  onPublish,
  onSetCreatePostStep,
}) => {
  return (
    <TouchableWithoutFeedback>
      <View style={styles.step2Container}>
        <View style={styles.previewSection}>
          {photo ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={() => onSetCreatePostStep(1)}
              >
                <Text style={styles.changePhotoText}>Изменить фото</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.textOnlyPreview}>
              <Ionicons name="document-text" size={64} color="#dbdbdb" />
              <Text style={styles.textOnlyText}>Текстовый пост</Text>
            </View>
          )}
        </View>

        <View style={styles.captionSection}>
          <Text style={styles.captionLabel}>Подпись</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Напишите подпись..."
            placeholderTextColor="#8E8E8E"
            value={newPost}
            onChangeText={onSetNewPost}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{newPost.length}/2200</Text>
        </View>

        <View style={styles.step2Actions}>
          <TouchableOpacity
            style={[
              styles.publishButton,
              !newPost.trim() && !photo && styles.publishButtonDisabled,
            ]}
            onPress={onPublish}
            disabled={uploading || (!newPost.trim() && !photo)}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.publishButtonText}>Опубликовать</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  step2Container: {
    flex: 1,
    padding: 15,
  },
  previewSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  photoPreview: {
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  changePhotoButton: {
    padding: 10,
  },
  changePhotoText: {
    color: "#0095F6",
    fontWeight: "600",
  },
  textOnlyPreview: {
    alignItems: "center",
    padding: 40,
    borderWidth: 2,
    borderColor: "#dbdbdb",
    borderStyle: "dashed",
    borderRadius: 10,
    marginBottom: 10,
  },
  textOnlyText: {
    marginTop: 10,
    color: "#8e8e8e",
    fontSize: 16,
  },
  captionSection: {
    marginBottom: 20,
  },
  captionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#262626",
  },
  captionInput: {
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#8e8e8e",
    marginTop: 5,
  },
  step2Actions: {
    marginTop: "auto",
  },
  publishButton: {
    backgroundColor: "#0095F6",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  publishButtonDisabled: {
    backgroundColor: "#B2DFFC",
  },
  publishButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default CreatePostStep2;