import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  useTheme,
  AppBar,
  Toolbar
} from '@mui/material';
import { Visibility, VisibilityOff, DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { useAuth } from '../utils/AuthContext';
import { useThemeContext } from '../utils/ThemeContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { themeMode, toggleTheme } = useThemeContext();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
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
              Вход в аккаунт
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
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || "Введите ваш пароль"}
              variant="outlined"
              sx={{ mb: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
              {loading ? 'Вход...' : 'Войти в аккаунт'}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              Нет аккаунта?{' '}
              <Link
                to="/register"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                  fontWeight: 500
                }}
              >
                Зарегистрироваться
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;