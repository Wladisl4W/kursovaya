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
import { useAuth } from '../utils/AuthContext';
import AddStoreDialog from '../components/AddStoreDialog';
import StoresList from '../components/StoresList';
import ProductsView from '../components/ProductsView';
import MappingsView from '../components/MappingsView';

function DashboardPage() {
  const { user, logout } = useAuth();
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
      variant="text"
      startIcon={icon}
      onClick={onClick}
      sx={{
        px: 3,
        py: 1.5,
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: isActive ? 'bold' : 'normal',
        fontSize: '1rem',
        color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
        background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
        '&:hover': {
          background: isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      {label}
    </Button>
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
            }}
          >
            <StoreIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
              {stats.stores}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Магазинов</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
            }}
          >
            <ProductsIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
              {stats.products}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Товаров</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'rgba(147, 51, 234, 0.15)',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
            }}
          >
            <MappingsIcon sx={{ fontSize: 40, color: '#9333ea', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
              {stats.mappings}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Сопоставлений</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 4,
          p: 1,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
        }}
      >
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

      {/* Content for selected tab */}
      <Box>
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
        {activeSection === 1 && <ProductsView />}
        {activeSection === 2 && <MappingsView />}
      </Box>

      <AddStoreDialog
        open={showAddStore}
        onClose={() => setShowAddStore(false)}
      />
    </Box>
  );
}

export default DashboardPage;