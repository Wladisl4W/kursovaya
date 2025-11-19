import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  Grid
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as ProductsIcon,
  Compare as MappingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import AddStoreDialog from '../components/AddStoreDialog';
import StoresList from '../components/StoresList';
import ProductsView from '../components/ProductsView';
import MappingsView from '../components/MappingsView';

function DashboardPage() {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
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

    // Обработчик события для кнопки "Добавить магазин"
    const handleAddStoreClick = () => {
      setActiveSection(0);
      setShowAddStore(true);
    };

    window.addEventListener('addStoreClick', handleAddStoreClick);

    return () => {
      window.removeEventListener('addStoreClick', handleAddStoreClick);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Компонент карточки-переключателя
  const StatCardWithAction = ({ index, icon, label, count, isActive, onClick, color, lightColor, darkColor }) => (
    <Box
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: '16px',
        background: isActive ? lightColor : 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${isActive ? darkColor : 'rgba(255, 255, 255, 0.1)'}`,
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: isActive ? lightColor : 'rgba(255, 255, 255, 0.08)',
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      {icon}
      <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mt: 1 }}>
        {count}
      </Typography>
      <Typography sx={{ color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)' }}>
        {label}
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
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Top bar with user info and logout - фиксированная высота */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          py: 2,
          flexShrink: 0, // Не сжимается
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
            Привет, {user?.email}!
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
            }}
          >
            Управление вашими маркетплейсами
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

      {/* Statistics Cards - фиксированная высота */}
      <Grid container spacing={3} sx={{ mb: 4, flexShrink: 0 }}> {/* Не сжимается */}
        <Grid item xs={12} sm={4}>
          <StatCardWithAction
            index={0}
            icon={<StoreIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />}
            label="Магазинов"
            count={stats.stores}
            isActive={activeSection === 0}
            onClick={() => setActiveSection(0)}
            color="#3b82f6"
            lightColor="rgba(59, 130, 246, 0.2)"
            darkColor="rgba(59, 130, 246, 0.3)"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCardWithAction
            index={1}
            icon={<ProductsIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />}
            label="Товаров"
            count={stats.products}
            isActive={activeSection === 1}
            onClick={() => setActiveSection(1)}
            color="#10b981"
            lightColor="rgba(16, 185, 129, 0.2)"
            darkColor="rgba(16, 185, 129, 0.3)"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCardWithAction
            index={2}
            icon={<MappingsIcon sx={{ fontSize: 40, color: '#9333ea', mb: 1 }} />}
            label="Сопоставлений"
            count={stats.mappings}
            isActive={activeSection === 2}
            onClick={() => setActiveSection(2)}
            color="#9333ea"
            lightColor="rgba(147, 51, 234, 0.2)"
            darkColor="rgba(147, 51, 234, 0.3)"
          />
        </Grid>
      </Grid>

      {/* Content area with fixed height and scroll */}
      <Box
        sx={{
          flex: 1, // Занимает оставшееся пространство
          overflow: 'auto', // Добавляет прокрутку при необходимости
          minWidth: 0, // Позволяет контейнеру уменьшаться до содержимого
        }}
      >
        {activeSection === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Ваши магазины
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddStore(true)}
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
                Добавить магазин
              </Button>
            </Box>
            <StoresList />
          </Box>
        )}
        {activeSection === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Товары из маркетплейсов
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {/* TODO: Implement filtering functionality */}}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: 2,
                    py: 1,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    }
                  }}
                >
                  Фильтровать
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddStore(true)}
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
                  Добавить магазин
                </Button>
              </Box>
            </Box>
            <ProductsView />
          </Box>
        )}
        {activeSection === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Объединенные товары
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {/* TODO: Implement sorting functionality */}}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: 2,
                    py: 1,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    }
                  }}
                >
                  Сортировать
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddStore(true)}
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
                  Добавить магазин
                </Button>
              </Box>
            </Box>
            <MappingsView />
          </Box>
        )}
      </Box>

      <AddStoreDialog
        open={showAddStore}
        onClose={() => setShowAddStore(false)}
      />
    </Box>
  );
}

export default DashboardPage;