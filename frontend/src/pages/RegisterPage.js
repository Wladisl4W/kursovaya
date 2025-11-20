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
  Collapse
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerAction } from '../redux/slices/authSlice';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: authLoading, error: authError } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Проверяем совпадение паролей
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(registerAction({ email, password })).unwrap();

      if (result) {
        // После регистрации перенаправляем на страницу входа
        navigate('/login');
      }
    } catch (err) {
      setError(err || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            background: 'linear-gradient(135deg, #10b981, #34d399)',
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
          Создание аккаунта
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          Зарегистрируйтесь, чтобы начать
        </Typography>
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

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
                borderColor: '#10b981',
              },
              '& input': {
                py: '14px',
                px: '16px',
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#10b981',
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
                borderColor: '#10b981',
              },
              '& input': {
                py: '14px',
                px: '16px',
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#10b981',
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

        <TextField
          fullWidth
          margin="normal"
          name="confirmPassword"
          label="Подтверждение пароля"
          type={showConfirmPassword ? "text" : "password"}
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
                borderColor: '#10b981',
              },
              '& input': {
                py: '14px',
                px: '16px',
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#10b981',
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
                  aria-label="toggle confirm password visibility"
                  onClick={handleClickShowConfirmPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669, #10b981)',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 8px 10px -6px rgba(16, 185, 129, 0.3)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)',
            }
          }}
          disabled={loading || authLoading}
        >
          {loading || authLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>

        <Typography
          variant="body2"
          sx={{
            mt: 3,
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            style={{
              color: '#34d399',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Войти
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default RegisterPage;