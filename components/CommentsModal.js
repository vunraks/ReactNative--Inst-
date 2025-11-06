import React from "react";
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../contexts/UserContext";

const CommentsModal = ({
  visible,
  post,
  comments,
  commentText,
  onClose,
  onSetCommentText,
  onAddComment,
}) => {
  const { userProfile } = useUser();
  const userAvatar = userProfile?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.commentTime}>
          {new Date(item.createdAt?.toDate()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.commentsContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={styles.commentsSafeArea}>
          {/* Хедер комментариев */}
          <View style={styles.commentsHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#262626" />
            </TouchableOpacity>
            <Text style={styles.commentsTitle}>Комментарии</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Список комментариев */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderCommentItem}
            ListEmptyComponent={
              <View style={styles.noComments}>
                <Text style={styles.noCommentsText}>Пока нет комментариев</Text>
                <Text style={styles.noCommentsSubtext}>Будьте первым!</Text>
              </View>
            }
            contentContainerStyle={styles.commentsList}
          />

          {/* Поле ввода комментария с аватаркой пользователя */}
          <View style={styles.commentInputContainer}>
            <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
            <TextInput
              style={styles.commentInput}
              placeholder="Добавьте комментарий..."
              placeholderTextColor="#8E8E8E"
              value={commentText}
              onChangeText={onSetCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.commentSendButton,
                !commentText.trim() && styles.commentSendButtonDisabled,
              ]}
              onPress={onAddComment}
              disabled={!commentText.trim()}
            >
              <Text style={styles.commentSendText}>Отправить</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ... стили остаются такими же
  commentsContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  commentsSafeArea: {
    flex: 1,
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dbdbdb",
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  commentsList: {
    flexGrow: 1,
    padding: 15,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: "600",
    fontSize: 14,
    color: "#262626",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: "#262626",
    lineHeight: 18,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: "#8e8e8e",
  },
  noComments: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noCommentsText: {
    fontSize: 16,
    color: "#262626",
    fontWeight: "600",
    marginBottom: 8,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: "#8e8e8e",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#dbdbdb",
    backgroundColor: "white",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  commentSendButton: {
    backgroundColor: "#0095F6",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  commentSendButtonDisabled: {
    backgroundColor: "#B2DFFC",
  },
  commentSendText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default CommentsModal;