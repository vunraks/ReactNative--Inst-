import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EmptyState = ({ onShowCreatePost }) => {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="camera-outline" size={64} color="#dbdbdb" />
      <Text style={styles.emptyStateTitle}>Публикаций пока нет</Text>
      <Text style={styles.emptyStateText}>
        Будьте первым, кто поделится чем-то интересным!
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={onShowCreatePost}
      >
        <Text style={styles.emptyStateButtonText}>Создать первый пост</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#8e8e8e",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: "#0095F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default EmptyState;