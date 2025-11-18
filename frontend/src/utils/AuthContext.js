import React, { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

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
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};