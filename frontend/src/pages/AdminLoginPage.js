import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Collapse
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { setAdminToken } from '../redux/slices/authSlice';
import { adminAPI } from '../services/api';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminAPI.login(username, password);

      // Сохраняем токен администратора в Redux-хранилище
      dispatch(setAdminToken(response.data.token));

      // Перенаправляем на дашборд админки
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 401) {
        setError('Неверный логин или пароль. Пожалуйста, проверьте введенные данные.');
      } else {
        setError('Ошибка при входе. Проверьте логин и пароль.');
      }
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

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
        p: 3,
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.8rem',
            }}
          >
            MT
          </Typography>
        </Box>
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 1,
          }}
        >
          Админ-панель
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          Войдите как администратор
        </Typography>
      </Box>

      <Collapse in={!!error}>
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
          {error}
        </Alert>
      </Collapse>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          id="username"
          label="Логин"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          variant="outlined"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8b5cf6',
              },
              '& input': {
                py: '14px',
                px: '16px',
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#8b5cf6',
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
          margin="normal"
          name="password"
          label="Пароль"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8b5cf6',
              },
              '& input': {
                py: '14px',
                px: '16px',
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#8b5cf6',
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
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
              boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4), 0 8px 10px -6px rgba(139, 92, 246, 0.3)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)',
            }
          }}
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти как админ'}
        </Button>

        <Typography
          variant="body2"
          sx={{
            mt: 3,
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Назад ко входу?{' '}
          <Link
            to="/login"
            style={{
              color: '#a78bfa',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Войти как пользователь
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default AdminLoginPage;