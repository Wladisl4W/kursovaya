import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
} from '@mui/material';

// Полностью новый компонент макета
function Layout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#0f172a', // Темно-синий фон
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
            top: '10%',
            left: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(101,163,223,0.1) 0%, transparent 70%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '-5%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            left: '40%',
            width: '150px',
            height: '150px',
            transform: 'rotate(45deg)',
            background: 'linear-gradient(45deg, rgba(101,163,223,0.05) 0%, transparent 70%)',
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
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;