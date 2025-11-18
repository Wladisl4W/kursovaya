import React from 'react';
import { Outlet, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline
} from '@mui/material';
import {
  Menu as MenuIcon,
  Store as StoreIcon,
  Inventory as ProductsIcon,
  Compare as MappingsIcon,
  Person as AccountIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useThemeContext } from '../utils/ThemeContext';

// Глобальный компонент макета приложения
function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const location = useLocation();

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawerWidth = 240;

  // Проверяем, является ли текущий пользователь администратором
  const isAdmin = localStorage.getItem('admin_token') !== null;

  // Определяем, находимся ли мы в админке
  const isAdminPage = location.pathname.startsWith('/admin');

  // Формируем меню в зависимости от типа пользователя
  let menuItems = [];

  if (isAdmin && isAdminPage) {
    // Меню для администратора
    menuItems = [
      { text: 'Дашборд', icon: <DashboardIcon />, path: '/admin' },
      { text: 'Пользователи', icon: <AccountIcon />, path: '/admin/users' },
      { text: 'Магазины', icon: <StoreIcon />, path: '/admin/stores' },
      { text: 'Товары', icon: <ProductsIcon />, path: '/admin/products' },
      { text: 'Сопоставления', icon: <MappingsIcon />, path: '/admin/mappings' },
    ];
  } else if (!isAdminPage) {
    // Меню для обычного пользователя
    menuItems = [
      { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Магазины', icon: <StoreIcon />, path: '/dashboard' },
      { text: 'Товары', icon: <ProductsIcon />, path: '/dashboard' },
      { text: 'Сопоставления', icon: <MappingsIcon />, path: '/dashboard' },
      { text: 'Аккаунт', icon: <AccountIcon />, path: '/account' },
    ];

    // Добавляем ссылку на админку, если пользователь администратор
    if (isAdmin) {
      menuItems.push({ text: 'Админка', icon: <AdminIcon />, path: '/admin' });
    }
  }

  const { themeMode, toggleTheme } = useThemeContext();

  // Компонент боковой панели
  const drawer = (
    <div>
      <Toolbar sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: 1,
        backgroundColor: themeMode === 'dark' ? '#1e1e1e' : '#ffffff'
      }}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              sx={{
                backgroundColor: location.pathname === item.path
                  ? (themeMode === 'dark' ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)')
                  : 'transparent',
                borderRadius: 2,
                mx: 1,
                mb: 0.5
              }}
            >
              <ListItemIcon sx={{
                color: location.pathname === item.path
                  ? 'primary.main'
                  : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: location.pathname === item.path
                    ? 'primary.main'
                    : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 'auto', mb: 2 }} />

      {/* Переключатель темы в боковом меню */}
      <Box sx={{ px: 2, py: 1 }}>
        <Button
          startIcon={themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          onClick={toggleTheme}
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            borderRadius: 2,
            color: themeMode === 'dark' ? '#e0e0e0' : '#424242',
            '&:hover': {
              backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {themeMode === 'dark' ? 'Светлая тема' : 'Темная тема'}
        </Button>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Сайдбар для десктопа */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
            color: themeMode === 'dark' ? '#e0e0e0' : '#424242',
            borderRight: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)'
          },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
            color: themeMode === 'dark' ? '#e0e0e0' : '#424242',
            borderRight: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
            mt: 0, // Убран отступ сверху
            height: '100vh'
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: themeMode === 'dark' ? '#121212' : '#f5f5f7',
          minHeight: '100vh',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 0, md: 0 } // Убран отступ сверху
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;