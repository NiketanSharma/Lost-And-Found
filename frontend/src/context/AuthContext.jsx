import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/api/notifications/unread-count/');
      setUnreadCount(res.data.unread_count || 0);
    } catch {
      // ignore
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const res = await api.get('/api/auth/profile/');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      fetchUnreadCount();
      return res.data;
    } catch (err) {
      console.error('Failed to load profile', err);
      // If unauthorized, clear
      if (err.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchUnreadCount]);

  useEffect(() => {
    fetchProfile();

    const handleAuthLogout = () => {
      setUser(null);
      setUnreadCount(0);
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [fetchProfile]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/api/auth/login/', { username, password });
      const { access, refresh, user: userData } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      fetchUnreadCount();
      toast.success(`Welcome back, ${userData.display_name || userData.username}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Invalid username or password.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/api/auth/register/', userData);
      const { access, refresh, user: newUser } = res.data;
      if (access && refresh) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        fetchUnreadCount();
      }
      toast.success('Registration successful! Welcome to Findr.');
      return { success: true };
    } catch (err) {
      const errors = err.response?.data;
      let errorMsg = 'Registration failed. Please check the form.';
      if (errors) {
        if (typeof errors === 'string') {
          errorMsg = errors;
        } else if (errors.username) {
          errorMsg = `Username: ${errors.username[0]}`;
        } else if (errors.email) {
          errorMsg = `Email: ${errors.email[0]}`;
        } else if (errors.confirm_password) {
          errorMsg = errors.confirm_password[0];
        } else if (errors.password) {
          errorMsg = `Password: ${errors.password[0]}`;
        }
      }
      toast.error(errorMsg);
      return { success: false, error: errorMsg, errors };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setUnreadCount(0);
    toast.success('Logged out successfully.');
  };

  const updateProfile = async (formData) => {
    try {
      // Use multipart if sending avatar
      const isMultipart = formData instanceof FormData;
      const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const res = await api.patch('/api/auth/profile/', formData, config);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Profile updated successfully!');
      return { success: true, user: res.data };
    } catch (err) {
      toast.error('Failed to update profile.');
      return { success: false, error: err.response?.data };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        unreadCount,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile,
        fetchUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
