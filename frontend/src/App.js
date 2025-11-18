import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { ThemeProviderWrapper } from './utils/ThemeContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';

// Компонент для защищенных маршрутов
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

// Компонент для публичных маршрутов (если пользователь авторизован, перенаправляем на дашборд)
function PublicRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" /> : children;
}

// Компонент для защищенных админ-маршрутов
function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token'); // Используем отдельный токен для админки
  return token ? children : <Navigate to="/admin/login" />;
}

function App() {
  return (
    <ThemeProviderWrapper>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Layout>
                  <LoginPage />
                </Layout>
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Layout>
                  <RegisterPage />
                </Layout>
              </PublicRoute>
            } />
            <Route path="/" element={
              <PublicRoute>
                <Layout>
                  <LoginPage />
                </Layout>
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            {/* Админка теперь имеет отдельный маршрут с собственной аутентификацией */}
            <Route path="/admin/login" element={
              <Layout>
                <AdminLoginPage />
              </Layout>
            } />
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <AdminProtectedRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProviderWrapper>
  );
}

export default App;