import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      if (authenticated) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsAuth(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const updateAuthStatus = () => {
    const authenticated = isAuthenticated();
    if (authenticated) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsAuth(true);
    } else {
      setUser(null);
      setIsAuth(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuth, loading, updateAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
