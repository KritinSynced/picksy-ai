import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

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

  // Safely capture Clerk hooks (will throw if ClerkProvider is absent)
  let clerkUser = null;
  let clerkIsLoaded = false;
  let clerkSignOut = null;

  try {
    const { user: cUser, isLoaded } = useUser();
    const { signOut } = useClerkAuth();
    clerkUser = cUser;
    clerkIsLoaded = isLoaded;
    clerkSignOut = signOut;
  } catch (e) {
    // ClerkProvider not mounted
  }

  // Handle Auth Session loading
  useEffect(() => {
    const syncUser = async () => {
      if (clerkIsLoaded && clerkUser) {
        // Clerk is active and user is signed in
        try {
          const email = clerkUser.primaryEmailAddress?.emailAddress;
          const fullName = clerkUser.fullName;
          const clerkId = clerkUser.id;

          if (email && clerkId) {
            const response = await axios.post(`${API_URL}/users/sync-clerk`, {
              clerkId,
              email,
              fullName
            });
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (err) {
          console.error('Clerk sync failure:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // Clerk is active but no active session, check for local Sandbox persona
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            // Only restore if it is a simulated sandbox user (simulated users don't have clerkId)
            if (!parsed.clerkId || !clerkIsLoaded) {
              // Fetch latest profile state from database
              const response = await axios.get(`${API_URL}/users/${parsed._id}`);
              setUser(response.data);
              localStorage.setItem('user', JSON.stringify(response.data));
            } else {
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (_) {
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    };

    syncUser();
  }, [clerkUser, clerkIsLoaded]);

  // Persona Switching mechanism (for Recruiter Sandbox demo)
  const loginAsSimulatedUser = async (simulatedUserId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/users/${simulatedUserId}`);
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Sandbox login failed.';
      setError(errMsg);
      setLoading(false);
      return { success: false, message: errMsg };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/users/login`, { email, password });
      const userData = response.data.user;
      
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

  const logout = async () => {
    if (clerkSignOut) {
      try {
        await clerkSignOut();
      } catch (err) {
        console.error('Clerk signout error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  const updatePreferences = async (preferences) => {
    if (!user) return { success: false, message: 'Must be logged in.' };
    
    try {
      setError(null);
      const response = await axios.put(`${API_URL}/users/${user._id}/preferences`, preferences);
      
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
    if (!user) return;
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
      loginAsSimulatedUser,
      logout,
      updatePreferences,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
