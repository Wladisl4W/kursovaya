import React, { useState } from 'react';
import {
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as ProductsIcon,
  Compare as MappingsIcon,
  People as UsersIcon,
  ExitToApp as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useThemeContext } from '../utils/ThemeContext';

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    products: 0,
    mappings: 0
  });

  const { themeMode, toggleTheme } = useThemeContext();

  const handleLogout = () => {
    // Удаляем токен администратора
    localStorage.removeItem('admin_token');
    // Перенаправляем на страницу входа в админку
    window.location.href = '/admin/login';
  };

  // Карточки статистики
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#121212' : '#f5f5f7',
      }}
    >
      {/* Шапка с переключателем темы */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
          color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#424242',
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
            Admin Panel
          </Typography>

          {/* Переключатель темы */}
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)'
              }
            }}
            aria-label="toggle theme"
          >
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              ml: 2,
              fontSize: '0.9rem',
              fontWeight: 'medium',
              borderRadius: 2,
              px: 2
            }}
          >
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      {/* Основной контент */}
      <Box sx={{ flex: 1, px: 3, py: 2 }}>
        {/* Шапка */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          py: 2,
          px: 1,
          borderRadius: 2,
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5'
        }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Админ-панель
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Управление системой
            </Typography>
          </Box>
        </Box>

        {/* Статистика */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Пользователи"
              value={stats.users}
              icon={<UsersIcon />}
              color="primary.main"
              subtitle="Всего зарегистрировано"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Магазины"
              value={stats.stores}
              icon={<StoreIcon />}
              color="secondary.main"
              subtitle="Всего подключено"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Товары"
              value={stats.products}
              icon={<ProductsIcon />}
              color="success.main"
              subtitle="Всего в системе"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Сопоставления"
              value={stats.mappings}
              icon={<MappingsIcon />}
              color="info.main"
              subtitle="Всего создано"
            />
          </Grid>
        </Grid>

        {/* Контент */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Управление системой
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Добро пожаловать в админ-панель системы отслеживания маркетплейсов.
            Здесь вы можете управлять пользователями, просматривать статистику и настраивать систему.
          </Typography>
        </Paper>

        {/* Дополнительные действия */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <UsersIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Управление пользователями
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Просмотр, добавление и удаление пользователей системы
              </Typography>
              <Button variant="contained" color="primary">
                Перейти
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <StoreIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Управление магазинами
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Просмотр и модерация подключенных магазинов
              </Typography>
              <Button variant="contained" color="secondary">
                Перейти
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <ProductsIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Управление товарами
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Просмотр и анализ товаров в системе
              </Typography>
              <Button variant="contained" color="success">
                Перейти
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default AdminDashboard;