import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    username: '',
    avatar: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      
      if (user) {
        setUser(user);
        
        // Подписываемся на изменения профиля в Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          console.log('Profile snapshot:', docSnap.exists());
          
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            console.log('Profile data from Firestore:', profileData);
            
            // Мапим поля из Firestore в наш формат
            const mappedProfile = {
              username: profileData.username || profileData.displayName || user.email?.split('@')[0] || 'User',
              avatar: profileData.profilePicture || profileData.avatar || user.photoURL || 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
              bio: profileData.bio || '',
              email: profileData.email || user.email,
              displayName: profileData.displayName,
              profilePicture: profileData.profilePicture
            };
            
            console.log('Mapped profile:', mappedProfile);
            setUserProfile(mappedProfile);
          } else {
            // Если документа нет, создаем его и используем данные из Auth
            const defaultProfile = {
              username: user.displayName || user.email?.split('@')[0] || 'User',
              avatar: user.photoURL || 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
              displayName: user.displayName,
              profilePicture: user.photoURL,
              email: user.email,
              createdAt: new Date()
            };
            
            console.log('Default profile:', defaultProfile);
            setUserProfile(defaultProfile);
            
            // Создаем документ пользователя в Firestore
            setDoc(userDocRef, {
              username: defaultProfile.username,
              displayName: defaultProfile.displayName,
              profilePicture: defaultProfile.profilePicture,
              email: defaultProfile.email,
              createdAt: new Date()
            }).catch(console.error);
          }
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        console.log('No user');
        setUser(null);
        setUserProfile({
          username: '',
          avatar: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
        });
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  const updateUserProfile = async (newProfile) => {
    if (!user) return;

    try {
      // Преобразуем наши поля в формат Firestore
      const firestoreProfile = {
        username: newProfile.username,
        displayName: newProfile.displayName || newProfile.username,
        profilePicture: newProfile.avatar,
        bio: newProfile.bio,
        updatedAt: new Date()
      };

      // Обновляем в Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, firestoreProfile, { merge: true });
      
      // Обновляем в состоянии (в нашем формате)
      setUserProfile(prev => ({ 
        ...prev, 
        username: newProfile.username,
        avatar: newProfile.avatar,
        bio: newProfile.bio,
        displayName: newProfile.displayName || newProfile.username
      }));
      
      // Обновляем в Firebase Auth
      if (newProfile.avatar || newProfile.username) {
        await updateProfile(user, {
          displayName: newProfile.displayName || newProfile.username,
          photoURL: newProfile.avatar
        });
      }
      
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    updateUserProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};