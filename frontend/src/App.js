import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import { AuthProvider } from './src/utils/AuthContext';
import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';
import DashboardPage from './src/pages/DashboardPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<LoginPage />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;