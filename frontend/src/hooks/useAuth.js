import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '../redux/slices/authSlice';

export const useAuth = () => {
  const { user, token, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  // Проверяем, действителен ли токен
  const isAuthenticated = !!token;

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    logout
  };
};