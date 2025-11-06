import React from "react";
import {
  Modal,
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EditPostModal = ({
  visible,
  editingPost,
  editPostText,
  uploading,
  onCancel,
  onSetEditPostText,
  onEditPost,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onCancel}>
            <Ionicons name="close" size={24} color="#262626" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Редактировать пост</Text>
          <TouchableOpacity onPress={onEditPost} disabled={uploading}>
            <Text style={[styles.backButton, uploading && styles.disabledText]}>
              {uploading ? "Сохранение..." : "Сохранить"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.editSection}>
            <Text style={styles.captionLabel}>Текст поста</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Введите текст поста..."
              placeholderTextColor="#8E8E8E"
              value={editPostText}
              onChangeText={onSetEditPostText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{editPostText.length}/2200</Text>
          </View>

          {editingPost?.imageUrl && (
            <View style={styles.previewSection}>
              <Text style={styles.captionLabel}>Изображение</Text>
              <Image
                source={{ uri: editingPost.imageUrl }}
                style={styles.previewImage}
              />
              <Text style={styles.imageNote}>
                Изображение нельзя изменить после публикации
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DBDBDB",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    color: "#0095F6",
    fontWeight: "600",
  },
  disabledText: {
    color: "#B2DFFC",
  },
  modalContent: {
    flex: 1,
    padding: 15,
  },
  editSection: {
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
  previewSection: {
    marginTop: 20,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageNote: {
    fontSize: 12,
    color: "#8e8e8e",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default EditPostModal;