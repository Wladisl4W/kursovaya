// services/api.js
import axios from 'axios';

// Получаем URL API из переменной окружения или используем значение по умолчанию
// Добавляем '/api' к базовому URL, так как все эндпоинты в бэкенде начинаются с '/api'
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Если в URL есть '/api', удаляем его, чтобы избежать дублирования
if (API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.slice(0, -4);
}

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Перехватчик запросов для добавления токена аутентификации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибок аутентификации
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }
    // Log error for debugging
    console.error('API error:', error);
    return Promise.reject(error);
  }
);

// Аутентификация
export const authAPI = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
};

// Админ-аутентификация (отдельный экземпляр для админ-токенов)
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Перехватчик запросов для админ-аутентификации
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Admin request error:', error);
    return Promise.reject(error);
  }
);

// Перехватчик ответов для админ-аутентификации
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибок админ-аутентификации
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    // Log error for debugging
    console.error('Admin API error:', error);
    return Promise.reject(error);
  }
);

// Админ-аутентификация
export const adminAPI = {
  login: (username, password) => adminApi.post('/admin/login', { username, password }),
};

// Магазины
export const storesAPI = {
  getStores: () => api.get('/stores'),
  addStore: (storeType, apiToken) => api.post('/stores', { type: storeType, api_token: apiToken }),
  deleteStore: (storeId) => api.delete(`/stores/${storeId}`),
};

// Товары
export const productsAPI = {
  getProducts: () => api.get('/products'),
  getSavedProducts: () => api.get('/products/saved'),
};

// Сопоставления
export const mappingsAPI = {
  getMappings: () => api.get('/mappings'),
  createMapping: (product1Id, product2Id) => api.post('/mappings', { product1_id: product1Id, product2_id: product2Id }),
  deleteMapping: (mappingId) => api.delete(`/mappings/${mappingId}`),
};

export default api;