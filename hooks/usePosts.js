import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  getDoc 
} from "firebase/firestore";

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list = await Promise.all(
        snapshot.docs.map(async (document) => {
          const postData = document.data();
          const likesSnap = await getDoc(
            doc(db, "posts", document.id, "likes", auth.currentUser.uid)
          );
          
          return {
            id: document.id,
            ...postData,
            likedByUser: likesSnap.exists(),
          };
        })
      );
      
      setPosts(list);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { posts, loading };
};