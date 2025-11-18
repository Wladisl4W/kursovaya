import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user info from token if available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you would validate the token and fetch user data
      // For now, we'll just update the state
      try {
        // Extract user data from token (this is simplified)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const userData = JSON.parse(jsonPayload);

        setUser({
          id: userData.user_id,
          email: userData.email
        });
      } catch (e) {
        console.error('Error parsing token:', e);
        // If token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('auth-token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      const data = response.data;
      const userInfo = {
        id: data.user.id,
        email: data.user.email,
      };
      setToken(data.token);
      setUser(userInfo);
      localStorage.setItem('token', data.token);

      // Устанавливаем заголовок для будущих запросов
      localStorage.setItem('auth-token', data.token);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        // Сервер вернул ошибку
        return {
          success: false,
          error: error.response.data.error || 'Ошибка входа',
          errors: error.response.data.errors || null
        };
      } else if (error.request) {
        // Ошибка сети
        return {
          success: false,
          error: 'Ошибка соединения с сервером'
        };
      } else {
        // Другие ошибки
        return {
          success: false,
          error: 'Произошла ошибка при обработке запроса'
        };
      }
    }
  };

  const register = async (email, password) => {
    try {
      const response = await authAPI.register(email, password);

      const data = response.data;
      const userInfo = {
        id: data.user.id,
        email: data.user.email,
      };
      setToken(data.token);
      setUser(userInfo);
      localStorage.setItem('token', data.token);

      // Устанавливаем заголовок для будущих запросов
      localStorage.setItem('auth-token', data.token);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        // Сервер вернул ошибку
        return {
          success: false,
          error: error.response.data.error || 'Ошибка регистрации',
          errors: error.response.data.errors || null
        };
      } else if (error.request) {
        // Ошибка сети
        return {
          success: false,
          error: 'Ошибка соединения с сервером'
        };
      } else {
        // Другие ошибки
        return {
          success: false,
          error: 'Произошла ошибка при обработке запроса'
        };
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('auth-token');
    // Также удаляем админ-токен при выходе
    localStorage.removeItem('admin_token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};