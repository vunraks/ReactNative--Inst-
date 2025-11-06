import React from "react";
import {
  Modal,
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CreatePostStep1 from "./CreatePostStep1";
import CreatePostStep2 from "./CreatePostStep2";

const CreatePostModal = ({
  visible,
  createPostStep,
  newPost,
  photo,
  uploading,
  onCancel,
  onSetCreatePostStep,
  onSetNewPost,
  onSetPhoto,
  onPublish,
  onPickImage,
  onTakePhoto,
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
          <Text style={styles.modalTitle}>
            {createPostStep === 1 ? "Новая публикация" : "Редактирование"}
          </Text>
          {createPostStep === 2 && (
            <TouchableOpacity onPress={() => onSetCreatePostStep(1)}>
              <Text style={styles.backButton}>Назад</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.modalContent}>
          {createPostStep === 1 ? (
            <CreatePostStep1
              onTakePhoto={onTakePhoto}
              onPickImage={onPickImage}
              onSetCreatePostStep={onSetCreatePostStep}
            />
          ) : (
            <CreatePostStep2
              newPost={newPost}
              photo={photo}
              uploading={uploading}
              onSetNewPost={onSetNewPost}
              onSetPhoto={onSetPhoto}
              onPublish={onPublish}
              onSetCreatePostStep={onSetCreatePostStep}
            />
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
  modalContent: {
    flex: 1,
    padding: 15,
  },
});

export default CreatePostModal;