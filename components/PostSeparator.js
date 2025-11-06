import React from "react";
import { View, StyleSheet } from "react-native";

const PostSeparator = () => {
  return (
    <View style={styles.postSeparator}>
      <View style={styles.separatorLine} />
      <View style={styles.separatorDots}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <View style={styles.separatorLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  postSeparator: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#dbdbdb",
  },
  separatorDots: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#dbdbdb",
    marginHorizontal: 2,
  },
});

export default PostSeparator;