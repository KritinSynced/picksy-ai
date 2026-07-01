import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user session on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Fetch fresh user data from server to keep histories in sync
          const response = await axios.get(`${API_URL}/users/${parsedUser._id}`);
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
          console.error('Session restoration failed:', err);
          // If server check fails (network down/removed user), fall back to stored user session
          try {
            setUser(JSON.parse(savedUser));
          } catch (_) {
            localStorage.removeItem('user');
          }
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/users/login`, { email, password });
      const userData = response.data.user;
      
      // Fetch fully populated user details (history, recommendations, cart)
      const detailsResponse = await axios.get(`${API_URL}/users/${userData._id}`);
      const fullUser = detailsResponse.data;
      
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const register = async (username, email, password, fullName) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/users/register`, {
        username,
        email,
        password,
        fullName
      });
      const userData = response.data.user;
      
      // Immediately log in the new user
      const detailsResponse = await axios.get(`${API_URL}/users/${userData._id}`);
      const fullUser = detailsResponse.data;
      
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try again.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updatePreferences = async (preferences) => {
    if (!user || user._id === 'guest') return { success: false, message: 'Must be logged in.' };
    
    try {
      setError(null);
      const response = await axios.put(`${API_URL}/users/${user._id}/preferences`, preferences);
      
      // Refetch user profile to sync updated preferences
      const detailsResponse = await axios.get(`${API_URL}/users/${user._id}`);
      const updatedUser = detailsResponse.data;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, preferences: response.data.preferences };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update preferences.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const refreshUser = async () => {
    if (!user || user._id === 'guest') return;
    try {
      const response = await axios.get(`${API_URL}/users/${user._id}`);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err) {
      console.error('Failed to refresh user details:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      error,
      login,
      register,
      logout,
      updatePreferences,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
