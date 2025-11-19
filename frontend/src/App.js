import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './redux/store';
import { ThemeProviderWrapper } from './utils/ThemeContext';
import Layout from './components/Layout';
import { CircularProgress, Box } from '@mui/material';

// Ленивая загрузка компонентов
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Компонент для защищенных маршрутов
function ProtectedRoute({ children }) {
  const { token } = useSelector((state) => state.auth); // Проверяем токен из Redux
  return token ? children : <Navigate to="/login" />;
}

// Компонент для публичных маршрутов (если пользователь авторизован, перенаправляем на дашборд)
function PublicRoute({ children }) {
  const { token } = useSelector((state) => state.auth); // Проверяем токен из Redux
  return token ? <Navigate to="/dashboard" /> : children;
}

// Компонент для защищенных админ-маршрутов
function AdminProtectedRoute({ children }) {
  const { adminToken } = useSelector((state) => state.auth); // Проверяем админ-токен из Redux
  return adminToken ? children : <Navigate to="/admin/login" />;
}

// Компонент загрузки
const LoadingComponent = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <Provider store={store}>
      <ThemeProviderWrapper>
        <Router>
          <Suspense fallback={<LoadingComponent />}>
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
          </Suspense>
        </Router>
      </ThemeProviderWrapper>
    </Provider>
  );
}

export default App;