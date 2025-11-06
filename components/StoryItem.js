import React from "react";
import { TouchableOpacity, Text, Image, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../contexts/UserContext";

const StoryItem = ({ item }) => {
  const { userProfile } = useUser();
  
  // Для "Вашей истории" используем актуальную аватарку из контекста
  const avatarSource = item.isUser 
    ? (userProfile?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png")
    : item.avatar;

  return (
    <TouchableOpacity style={styles.storyContainer}>
      <View
        style={[
          styles.storyCircle,
          item.isUser && styles.userStoryCircle,
          item.hasNew && styles.newStory,
        ]}
      >
        <Image 
          source={{ uri: avatarSource }} 
          style={styles.storyAvatar} 
        />
        {item.isUser && (
          <View style={styles.plusIcon}>
            <Ionicons name="add" size={16} color="white" />
          </View>
        )}
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>
        {item.isUser ? "Ваша история" : item.username}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  storyContainer: {
    alignItems: "center",
    marginHorizontal: 5,
    width: 70,
  },
  storyCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: "#E1306C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  userStoryCircle: {
    borderColor: "#DBDBDB",
  },
  newStory: {
    borderColor: "#E1306C",
  },
  storyAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  plusIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0095F6",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  storyUsername: {
    fontSize: 12,
    color: "#262626",
  },
});

export default StoryItem;