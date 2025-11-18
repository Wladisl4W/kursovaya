import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  useTheme,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { useAuth } from '../utils/AuthContext';
import { useThemeContext } from '../utils/ThemeContext';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { themeMode, toggleTheme } = useThemeContext();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setError('');
    setFieldErrors({});
    setLoading(true);

    const result = await register(email, password);

    if (result.success) {
      // Проверяем, является ли пользователь администратором
      if (email === 'admin@example.com' || email === 'feed45537@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      if (result.errors) {
        // Ошибки валидации полей
        setFieldErrors(result.errors);
      } else {
        setError(result.error);
      }
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f7',
      }}
    >
      {/* Упрощенная шапка только с переключением темы */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
          color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#424242',
          boxShadow: 1,
          mb: 3
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold' }}
          >
            MarketTracker
          </Typography>

          {/* Переключатель темы */}
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)'
              }
            }}
            aria-label="toggle theme"
          >
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: 420,
            p: 4,
            borderRadius: 3,
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              MarketTracker
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
            >
              Создание аккаунта
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              id="email"
              label="Электронная почта"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || "Введите ваш email"}
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              margin="normal"
              name="password"
              label="Пароль"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || "Минимум 8 символов"}
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              margin="normal"
              name="confirmPassword"
              label="Подтверждение пароля"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              sx={{ mb: 1 }}
            />

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                fontWeight: 'medium',
                fontSize: '1rem',
                borderRadius: 2
              }}
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Создать аккаунт'}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                  fontWeight: 500
                }}
              >
                Войти
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default RegisterPage;