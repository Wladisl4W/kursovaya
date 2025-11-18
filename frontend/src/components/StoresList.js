import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { storesAPI } from '../services/api';

function StoresList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const theme = useTheme();

  // Используем useRef для отслеживания, размонтирован ли компонент
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setError('');
      const response = await storesAPI.getStores();
      // Добавляем дополнительную проверку на случай, если структура ответа отличается
      if (response.data && isMountedRef.current) {
        setStores(response.data);
      } else if (isMountedRef.current) {
        console.warn('Stores not found in response, using empty array:', response.data);
        setStores([]);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Failed to fetch stores:', err);
        setError('Ошибка при загрузке магазинов');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (storeId) => {
    try {
      await storesAPI.deleteStore(storeId);
      setStores(stores.filter(store => store.id !== storeId));
    } catch (err) {
      console.error('Failed to delete store:', err);
      setError('Ошибка при удалении магазина');
    } finally {
      handleCloseMenu();
    }
  };

  const handleMenuOpen = (event, storeId) => {
    setAnchorEl(event.currentTarget);
    setSelectedStoreId(storeId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedStoreId(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {stores.length === 0 ? (
        <Card
          sx={{
            textAlign: 'center',
            py: 6,
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
            border: `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}
        >
          <CardContent>
            <StoreIcon sx={{ fontSize: 60, color: 'action.active', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Нет подключенных магазинов
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Добавьте первый магазин, чтобы начать отслеживание товаров
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {stores.map((store) => (
            <Grid item xs={12} md={6} lg={4} key={store.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: theme.palette.mode === 'dark' ? '0px 4px 20px rgba(0, 0, 0, 0.4)' : '0px 4px 20px rgba(0, 0, 0, 0.08)',
                  backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#ffffff',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.palette.mode === 'dark' ? '0px 8px 30px rgba(0, 0, 0, 0.6)' : '0px 8px 30px rgba(0, 0, 0, 0.15)',
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '16px',
                        backgroundColor: store.type === 'ozon'
                          ? 'rgba(25, 118, 210, 0.1)'
                          : 'rgba(255, 152, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <StoreIcon
                        sx={{
                          fontSize: 36,
                          color: store.type === 'ozon'
                            ? theme.palette.primary.main
                            : theme.palette.warning.main
                        }}
                      />
                    </Box>
                  }
                  action={
                    <IconButton
                      aria-label="settings"
                      onClick={(e) => handleMenuOpen(e, store.id)}
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#b0b0b0' : '#757575',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#333333' }}
                    >
                      {store.type === 'wb' ? 'Wildberries' : 'Ozon'}
                    </Typography>
                  }
                  subheader={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      ID: {store.id}
                    </Typography>
                  }
                  sx={{ pb: 1, pt: 2, px: 2 }}
                />

                <CardContent sx={{ flexGrow: 1, pt: 0, px: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Дата добавления
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'Неизвестно'}
                    </Typography>
                  </Box>

                  <Chip
                    label={store.type === 'wb' ? 'Wildberries' : 'Ozon'}
                    size="small"
                    sx={{
                      borderRadius: 16,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      height: '24px',
                      '& .MuiChip-label': {
                        paddingLeft: '12px',
                        paddingRight: '12px',
                      }
                    }}
                    color={store.type === 'ozon' ? 'primary' : 'warning'}
                    variant="filled"
                  />
                </CardContent>

                <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 2,
                      py: 1
                    }}
                  >
                    Отвязать
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Меню действий над магазином */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 0.5,
            boxShadow: theme.shadows[6]
          }
        }}
      >
        <MenuItem
          onClick={() => handleDelete(selectedStoreId)}
          sx={{
            color: 'error.main',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(244, 67, 54, 0.1)'
                : 'rgba(244, 67, 54, 0.04)'
            }
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Удалить магазин
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default StoresList;