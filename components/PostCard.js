import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import { useUser } from "../contexts/UserContext";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

const { width: screenWidth } = Dimensions.get("window");

const PostCard = ({ post, onOpenComments, onShowPostActions }) => {
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(post.likedByUser || false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  const { userProfile } = useUser();
  const userAvatar = userProfile?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  // Определяем переменные ДО их использования
  const isCurrentUserPost = post.userId === auth.currentUser.uid;
  const shouldTruncate = post.text && post.text.length > 100;

  useEffect(() => {
    const likesUnsub = onSnapshot(
      collection(db, "posts", post.id, "likes"),
      (snap) => {
        setLikesCount(snap.size);
        setLiked(snap.docs.some((d) => d.id === auth.currentUser.uid));
      }
    );

    const commentsUnsub = onSnapshot(
      collection(db, "posts", post.id, "comments"),
      (snap) => {
        setCommentsCount(snap.size);
      }
    );

    return () => {
      likesUnsub();
      commentsUnsub();
    };
  }, [post.id]);

  const toggleLike = async () => {
    const likeRef = doc(db, "posts", post.id, "likes", auth.currentUser.uid);
    const likeSnap = await getDoc(likeRef);
    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });
    }
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          <Text style={styles.username}>{post.username}</Text>
        </View>
        {isCurrentUserPost && (
          <TouchableOpacity onPress={() => onShowPostActions(post)}>
            <Ionicons name="ellipsis-horizontal" size={16} color="#262626" />
          </TouchableOpacity>
        )}
      </View>

      {/* Post Image */}
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
      )}

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? "#ED4956" : "#262626"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onOpenComments(post.id)}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="paper-plane-outline" size={22} color="#262626" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={toggleBookmark} style={styles.actionBtn}>
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color="#262626"
          />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      {likesCount > 0 && (
        <Text style={styles.likesCount}>{likesCount} отметок "Нравится"</Text>
      )}

      {/* Post Text */}
      {post.text ? (
        <View style={styles.postTextContainer}>
          <Text style={styles.postText} numberOfLines={showFullText ? 0 : 2}>
            <Text style={styles.username}>{post.username} </Text>
            {post.text}
          </Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setShowFullText(!showFullText)}>
              <Text style={styles.moreText}>
                {showFullText ? "Свернуть" : "Еще..."}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* Comments */}
      {commentsCount > 0 && (
        <TouchableOpacity onPress={() => onOpenComments(post.id)}>
          <Text style={styles.viewComments}>
            Посмотреть все комментарии ({commentsCount})
          </Text>
        </TouchableOpacity>
      )}

      {/* Add Comment Button с аватаркой */}
      <TouchableOpacity
        style={styles.addCommentContainer}
        onPress={() => onOpenComments(post.id)}
      >
        <Image source={{ uri: userAvatar }} style={styles.commentUserAvatar} />
        <Text style={styles.addCommentText}>Добавить комментарий...</Text>
      </TouchableOpacity>

      {/* Time */}
      <Text style={styles.postTime}>
        {post.updatedAt ? "ИЗМЕНЕНО • " : ""}
        {post.createdAt?.toDate
          ? new Date(post.createdAt.toDate()).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "2 ЧАСА НАЗАД"}
      </Text>

      {/* Индикатор конца поста */}
      <View style={styles.postEndIndicator}>
        <View style={styles.postEndLine} />
        <Text style={styles.postEndText}>Конец поста</Text>
        <View style={styles.postEndLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "white",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  postUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    fontWeight: "600",
    color: "#262626",
  },
  postImage: {
    width: screenWidth,
    height: screenWidth,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    marginRight: 12,
  },
  likesCount: {
    fontWeight: "600",
    color: "#262626",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  postTextContainer: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  postText: {
    color: "#262626",
    lineHeight: 18,
  },
  moreText: {
    color: "#8E8E8E",
    marginTop: 2,
  },
  viewComments: {
    color: "#8E8E8E",
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  addCommentText: {
    color: "#8e8e8e",
    fontSize: 14,
  },
  postTime: {
    color: "#8E8E8E",
    fontSize: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  postEndIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  postEndLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#dbdbdb",
  },
  postEndText: {
    fontSize: 12,
    color: "#8e8e8e",
    marginHorizontal: 10,
    fontWeight: "500",
  },
});

export default PostCard;