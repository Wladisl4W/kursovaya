import React, { useState } from 'react';
import {
  Typography,
  Button,
  Box,
  Grid
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as ProductsIcon,
  Compare as MappingsIcon,
  People as UsersIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../utils/AuthContext';

function AdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    products: 0,
    mappings: 0
  });

  const handleLogout = () => {
    // Удаляем токен администратора
    localStorage.removeItem('admin_token');
    // Перенаправляем на страницу входа в админку
    window.location.href = '/admin/login';
  };

  // Карточки статистики
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Box
      sx={{
        p: 3,
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          background: 'rgba(255, 255, 255, 0.08)',
        }
      }}
    >
      {icon}
      <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mt: 1, mb: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>{title}</Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
        {subtitle}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        p: 3,
      }}
    >
      {/* Top bar with user info and logout */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          py: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            Админ-панель
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
            }}
          >
            Панель управления системой
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              background: 'rgba(255, 255, 255, 0.05)',
            },
            px: 2,
            py: 1,
          }}
        >
          Выйти
        </Button>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Пользователи"
            value={stats.users}
            icon={<UsersIcon sx={{ fontSize: 40, color: '#f59e0b', mx: 'auto' }} />}
            color="primary.main"
            subtitle="Всего зарегистрировано"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Магазины"
            value={stats.stores}
            icon={<StoreIcon sx={{ fontSize: 40, color: '#3b82f6', mx: 'auto' }} />}
            color="secondary.main"
            subtitle="Всего подключено"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Товары"
            value={stats.products}
            icon={<ProductsIcon sx={{ fontSize: 40, color: '#10b981', mx: 'auto' }} />}
            color="success.main"
            subtitle="Всего в системе"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Сопоставления"
            value={stats.mappings}
            icon={<MappingsIcon sx={{ fontSize: 40, color: '#8b5cf6', mx: 'auto' }} />}
            color="info.main"
            subtitle="Всего создано"
          />
        </Grid>
      </Grid>

      {/* Контент */}
      <Box
        sx={{
          p: 3,
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          mb: 4,
        }}
      >
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
          Управление системой
        </Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Добро пожаловать в админ-панель системы отслеживания маркетплейсов.
          Здесь вы можете управлять пользователями, просматривать статистику и настраивать систему.
        </Typography>
      </Box>

      {/* Дополнительные действия */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Box
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                background: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <UsersIcon sx={{ fontSize: 60, color: '#f59e0b', mx: 'auto', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              Управление пользователями
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              Просмотр, добавление и удаление пользователей системы
            </Typography>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                }
              }}
            >
              Перейти
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                background: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <StoreIcon sx={{ fontSize: 60, color: '#3b82f6', mx: 'auto', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              Управление магазинами
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              Просмотр и модерация подключенных магазинов
            </Typography>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                }
              }}
            >
              Перейти
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                background: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <ProductsIcon sx={{ fontSize: 60, color: '#10b981', mx: 'auto', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              Управление товарами
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              Просмотр и анализ товаров в системе
            </Typography>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                }
              }}
            >
              Перейти
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboard;