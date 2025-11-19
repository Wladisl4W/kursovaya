import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useThemeContext } from '../utils/ThemeContext';

// Полностью новый компонент макета
function Layout({ children }) {
  const theme = useTheme();
  const { toggleTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        // Используем тему для фона
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Абстрактные геометрические формы для фона */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: isMobile ? '5%' : '10%',
            left: isMobile ? '-20%' : '-10%',
            width: isMobile ? '200px' : '300px',
            height: isMobile ? '200px' : '300px',
            borderRadius: '50%',
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(101,163,223,0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: isMobile ? '10%' : '20%',
            right: isMobile ? '-10%' : '-5%',
            width: isMobile ? '150px' : '250px',
            height: isMobile ? '150px' : '250px',
            borderRadius: '50%',
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(101,163,223,0.1) 0%, transparent 70%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: isMobile ? '50%' : '60%',
            left: isMobile ? '30%' : '40%',
            width: isMobile ? '100px' : '150px',
            height: isMobile ? '100px' : '150px',
            transform: 'rotate(45deg)',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, rgba(101,163,223,0.05) 0%, transparent 70%)'
              : 'linear-gradient(45deg, rgba(56,189,248,0.05) 0%, transparent 70%)',
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? 1 : 3, // Добавляем отступы на мобильных устройствах
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;