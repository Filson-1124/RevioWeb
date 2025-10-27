import { createContext, useState, useContext, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // Start as null until Firebase finishes
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        setIsLoggedIn(true);
        setCurrentUser(user);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

 return (
  <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, currentUser }}>
    {loading ? (
      <div className="min-h-screen flex items-center justify-center bg-[#12121A] text-white">
        Checking authentication...
      </div>
    ) : (
      children
    )}
  </AuthContext.Provider>
);

};

export const useAuth = () => useContext(AuthContext);