// src/hooks/useAuthStatus.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config'; // Import the auth instance

export const useAuthStatus = () => {
  const [user, setUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    // This function sets up a "watch" on the Firebase authentication status
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // currentUser is null if logged out, or an object if logged in
      setIsLoading(false); 
    });

    // The 'unsubscribe' function runs when the component is removed, preventing errors
    return unsubscribe; 
  }, []);

  // Return the current user object and the loading status
  return { user, isLoading };
};