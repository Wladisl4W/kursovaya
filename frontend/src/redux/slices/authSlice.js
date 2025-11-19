import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  adminToken: localStorage.getItem('admin_token') || null,
  loading: false,
  error: null,
};

// Асинхронный thunk для логина
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // Сохраняем токен в localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('auth-token', token);

      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка входа');
    }
  }
);

// Асинхронный thunk для регистрации
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(email, password);
      const { token, user } = response.data;

      // Сохраняем токен в localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('auth-token', token);

      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка регистрации');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('auth-token');
      // Также удаляем админ-токен при выходе
      localStorage.removeItem('admin_token');
    },
    setAdminToken: (state, action) => {
      state.adminToken = action.payload;
      localStorage.setItem('admin_token', action.payload);
    },
    clearAdminToken: (state) => {
      state.adminToken = null;
      localStorage.removeItem('admin_token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка логина
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Обработка регистрации
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setAdminToken, clearAdminToken, clearError } = authSlice.actions;
export default authSlice.reducer;