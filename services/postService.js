import { 
  addDoc, 
  collection, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import axios from "axios";

export const postService = {
  // Создание текстового поста
  async createTextPost(text, userProfile) {
    console.log('Creating text post with userProfile:', userProfile);
    
    const postData = {
      text: text.trim(),
      userId: auth.currentUser.uid,
      email: auth.currentUser.email,
      username: userProfile?.username || auth.currentUser.displayName || auth.currentUser.email.split("@")[0],
      userAvatar: userProfile?.avatar || auth.currentUser.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png",
      createdAt: serverTimestamp(),
    };

    console.log('Post data to save:', postData);
    
    return await addDoc(collection(db, "posts"), postData);
  },

  // Загрузка фото и создание поста
  async createPhotoPost(text, photoUri, userProfile) {
    console.log('Creating photo post with userProfile:', userProfile);
    
    const imageUrl = await this.uploadImage(photoUri);
    
    const postData = {
      text: text.trim(),
      imageUrl,
      userId: auth.currentUser.uid,
      email: auth.currentUser.email,
      username: userProfile?.username || auth.currentUser.displayName || auth.currentUser.email.split("@")[0],
      userAvatar: userProfile?.avatar || auth.currentUser.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png",
      createdAt: serverTimestamp(),
    };

    console.log('Photo post data to save:', postData);
    
    return await addDoc(collection(db, "posts"), postData);
  },

  // Загрузка изображения на Cloudinary
  async uploadImage(uri) {
    const data = new FormData();
    data.append("file", {
      uri: uri,
      type: "image/jpeg",
      name: "photo.jpg",
    });
    data.append("upload_preset", "unsigned_preset");
    data.append("cloud_name", "dsdc5dyol");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dsdc5dyol/image/upload",
      data
    );
    
    return res.data.secure_url;
  },

  // Редактирование поста
  async updatePost(postId, text) {
    return await updateDoc(doc(db, "posts", postId), {
      text: text.trim(),
      updatedAt: serverTimestamp(),
    });
  },

  // Удаление поста
  async deletePost(postId) {
    return await deleteDoc(doc(db, "posts", postId));
  },
};