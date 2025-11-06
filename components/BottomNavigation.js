import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../contexts/UserContext";

const BottomNavigation = ({ activeTab, onSetActiveTab, onShowCreatePost, navigation }) => {
  const { userProfile } = useUser();
  
  const userAvatar = userProfile?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onSetActiveTab("home")}
      >
        <Ionicons
          name={activeTab === "home" ? "home" : "home-outline"}
          size={24}
          color={activeTab === "home" ? "#262626" : "#8E8E8E"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onSetActiveTab("search")}
      >
        <Ionicons
          name={activeTab === "search" ? "search" : "search-outline"}
          size={24}
          color={activeTab === "search" ? "#262626" : "#8E8E8E"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={onShowCreatePost}
      >
        <Ionicons name="add-circle-outline" size={24} color="#8E8E8E" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          onSetActiveTab("reels");
          navigation.navigate("Reels");
        }}
      >
        <Ionicons
          name={activeTab === "reels" ? "play-circle" : "play-circle-outline"}
          size={24}
          color={activeTab === "reels" ? "#262626" : "#8E8E8E"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Profile")}
      >
        <Image
          source={{ uri: userAvatar }}
          style={styles.navAvatar}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#DBDBDB",
    backgroundColor: "white",
  },
  navItem: {
    alignItems: "center",
  },
  navAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBDBDB",
  },
});

export default BottomNavigation;