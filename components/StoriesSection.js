import React from "react";
import { View, FlatList, Animated, Platform, StyleSheet } from "react-native";
import StoryItem from "./StoryItem";

const StoriesSection = ({ stories, storiesTranslateY, storiesOpacity }) => {
  const renderStory = ({ item }) => <StoryItem item={item} />;

  return (
    <Animated.View
      style={[
        styles.storiesSection,
        {
          transform: [{ translateY: storiesTranslateY }],
          opacity: storiesOpacity,
        },
      ]}
    >
      <FlatList
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesList}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  storiesSection: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 10,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#DBDBDB",
  },
  storiesList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

export default StoriesSection;