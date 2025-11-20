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
  useTheme,
  Collapse
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginAction } from '../redux/slices/authSlice';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await dispatch(loginAction({ email, password })).unwrap();

      if (result) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err || 'Ошибка при входе. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Объединяем ошибки из состояния и локальные
  const displayError = authError || error;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 450,
        mx: 'auto',
        p: 4,
        borderRadius: '20px',
        background: 'rgba(30, 30, 30, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 2,
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            lineHeight: 1.2,
          }}
        >
          Marketplace Tracker
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Box sx={{
            flex: 1,
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            mr: 1
          }} />
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 400,
              mx: 1,
              minWidth: 'max-content',
              whiteSpace: 'nowrap'
            }}
          >
            Добро пожаловать
          </Typography>
          <Box sx={{
            flex: 1,
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            ml: 1
          }} />
        </Box>
      </Box>

      <Collapse in={!!displayError}>
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          {displayError}
        </Alert>
      </Collapse>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: '1.5px',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(59, 130, 246, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
                borderWidth: '2px',
              },
              '& input': {
                py: '15px',
                px: '18px',
                fontSize: '1rem',
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#3b82f6',
              }
            },
          }}
          InputLabelProps={{
            sx: {
              '&.Mui-focused': {
                color: 'rgba(255, 255, 255, 0.7)',
              }
            }
          }}
        />

        <TextField
          fullWidth
          name="password"
          label="Пароль"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: '1.5px',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(59, 130, 246, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
                borderWidth: '2px',
              },
              '& input': {
                py: '15px',
                px: '18px',
                fontSize: '1rem',
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#3b82f6',
              }
            },
          }}
          InputLabelProps={{
            sx: {
              '&.Mui-focused': {
                color: 'rgba(255, 255, 255, 0.7)',
              }
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            mt: 2,
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)',
            }
          }}
          disabled={loading || authLoading}
        >
          {loading || authLoading ? 'Вход...' : 'Войти'}
        </Button>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          Нет аккаунта?{' '}
          <Link
            to="/register"
            style={{
              color: '#93c5fd',
              textDecoration: 'none',
              fontWeight: 'bold',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#93c5fd';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'transparent';
            }}
          >
            Зарегистрироваться
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default LoginPage;