import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  IconButton,
  Fade
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as ProductsIcon,
  Compare as MappingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useAuth } from '../utils/AuthContext';
import { useThemeContext } from '../utils/ThemeContext';
import AddStoreDialog from '../components/AddStoreDialog';
import StoresList from '../components/StoresList';
import ProductsView from '../components/ProductsView';
import MappingsView from '../components/MappingsView';

function DashboardPage() {
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme } = useThemeContext();
  const [showAddStore, setShowAddStore] = useState(false);
  const [activeSection, setActiveSection] = useState(0); // 0 = магазины, 1 = товары, 2 = сопоставления
  const [stats, setStats] = useState({
    stores: 0,
    products: 0,
    mappings: 0
  });

  const theme = useTheme();

  // Используем useRef для отслеживания, размонтирован ли компонент
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Здесь можно загружать статистику с сервера
    // fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Компактные кнопки для переключения между разделами
  const SectionButton = ({ index, icon, label, isActive, onClick }) => (
    <Button
      variant={isActive ? "contained" : "outlined"}
      startIcon={icon}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: isActive ? 'bold' : 'medium',
        fontSize: '0.95rem',
        minWidth: 140,
        backgroundColor: isActive
          ? theme.palette.mode === 'dark'
            ? 'rgba(25, 118, 210, 0.2)'
            : 'rgba(25, 118, 210, 0.1)'
          : 'transparent',
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(0, 0, 0, 0.12)',
        color: isActive
          ? theme.palette.primary.main
          : theme.palette.text.primary,
        '&:hover': {
          backgroundColor: isActive
            ? theme.palette.mode === 'dark'
              ? 'rgba(25, 118, 210, 0.3)'
              : 'rgba(25, 118, 210, 0.2)'
            : theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      {label}
    </Button>
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f7',
        minHeight: '100vh',
        pb: 3,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Меню с кнопками управления в правом верхнем углу */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          p: 2,
          gap: 1
        }}
      >
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

        <Button
          variant="outlined"
          onClick={handleLogout}
          sx={{
            fontSize: '0.85rem',
            fontWeight: 'medium',
            borderRadius: 2,
            px: 2
          }}
        >
          Выйти
        </Button>
      </Box>

      {/* Основной контент */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          mx: 'auto',
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Привет, {user?.email}!
          </Typography>
        </Box>

        {/* Панель с кнопками навигации */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            mb: 3,
            py: 1.5,
            px: 2,
            borderRadius: 3,
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark' ? '0px 2px 8px rgba(0, 0, 0, 0.3)' : '0px 2px 8px rgba(0, 0, 0, 0.08)',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <SectionButton
              index={0}
              icon={<StoreIcon />}
              label="Магазины"
              isActive={activeSection === 0}
              onClick={() => setActiveSection(0)}
            />
            <SectionButton
              index={1}
              icon={<ProductsIcon />}
              label="Товары"
              isActive={activeSection === 1}
              onClick={() => setActiveSection(1)}
            />
            <SectionButton
              index={2}
              icon={<MappingsIcon />}
              label="Сопоставления"
              isActive={activeSection === 2}
              onClick={() => setActiveSection(2)}
            />
          </Box>
        </Box>

        {/* Контент для выбранной вкладки с анимацией */}
        <Fade in={true} timeout={300}>
          <Box sx={{ flex: 1 }}>
            {activeSection === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    Ваши магазины
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<StoreIcon />}
                    onClick={() => setShowAddStore(true)}
                    sx={{
                      fontWeight: 'medium',
                      fontSize: '0.9rem',
                      borderRadius: 2,
                      px: 2,
                      py: 1
                    }}
                  >
                    Добавить магазин
                  </Button>
                </Box>
                <StoresList />
              </Box>
            )}
            {activeSection === 1 && <ProductsView />}
            {activeSection === 2 && <MappingsView />}
          </Box>
        </Fade>
      </Box>

      <AddStoreDialog
        open={showAddStore}
        onClose={() => setShowAddStore(false)}
      />
    </Box>
  );
}

export default DashboardPage;