import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // To check initial auth state

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you might want to validate the token with the backend
      // For simplicity, we assume if a token exists, the user is authenticated
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const response = await authApi.login(username, password);
      localStorage.setItem('token', response.data.access_token);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  }, []);

  const value = {
    isAuthenticated,
    login,
    logout,
    loading,
  };

  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
