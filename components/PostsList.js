import React from "react";
import { View, FlatList, Animated, StyleSheet } from "react-native";
import PostCard from "./PostCard";
import PostSeparator from "./PostSeparator";
import EmptyState from "./EmptyState";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const PostsList = ({ 
  posts, 
  scrollY, 
  flatListRef, 
  onOpenComments, 
  onShowPostActions,
  onShowCreatePost 
}) => {
  const renderItem = ({ item, index }) => (
    <View>
      <PostCard
        post={item}
        onOpenComments={onOpenComments}
        onShowPostActions={onShowPostActions}
      />
      {index < posts.length - 1 && <PostSeparator />}
    </View>
  );

  return (
    <AnimatedFlatList
      ref={flatListRef}
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
      ListHeaderComponent={<View style={{ height: 140 }} />}
      ListEmptyComponent={<EmptyState onShowCreatePost={onShowCreatePost} />}
    />
  );
};

export default PostsList;