import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as ProductsIcon,
  Compare as MappingsIcon,
  People as UsersIcon,
  ExitToApp as LogoutIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { adminManagementAPI } from '../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    products: 0,
    mappings: 0
  });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'stores', 'products', 'mappings'

  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: '',
    id: null,
    name: ''
  });

  // Fetch stats and data
  useEffect(() => {
    fetchStats();
    fetchData(activeTab);
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await adminManagementAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Ошибка при загрузке статистики');
    }
  };

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'users':
          const usersResponse = await adminManagementAPI.getUsers();
          setUsers(usersResponse.data);
          break;
        case 'stores':
          const storesResponse = await adminManagementAPI.getStores();
          setStores(storesResponse.data);
          break;
        case 'products':
          const productsResponse = await adminManagementAPI.getProducts();
          setProducts(productsResponse.data);
          break;
        case 'mappings':
          const mappingsResponse = await adminManagementAPI.getMappings();
          setMappings(mappingsResponse.data);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Удаляем токен администратора
    localStorage.removeItem('admin_token');
    // Перенаправляем на страницу входа в админку
    window.location.href = '/admin/login';
  };

  const handleDeleteClick = (type, id, name) => {
    setDeleteDialog({
      open: true,
      type,
      id,
      name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      switch (deleteDialog.type) {
        case 'user':
          await adminManagementAPI.deleteUser(deleteDialog.id);
          setUsers(users.filter(user => user.id !== deleteDialog.id));
          setStats(prev => ({...prev, users: prev.users - 1}));
          break;
        case 'store':
          await adminManagementAPI.deleteStore(deleteDialog.id);
          setStores(stores.filter(store => store.id !== deleteDialog.id));
          setStats(prev => ({...prev, stores: prev.stores - 1}));
          break;
        case 'product':
          await adminManagementAPI.deleteProduct(deleteDialog.id);
          setProducts(products.filter(product => product.id !== deleteDialog.id));
          setStats(prev => ({...prev, products: prev.products - 1}));
          break;
        case 'mapping':
          await adminManagementAPI.deleteMapping(deleteDialog.id);
          setMappings(mappings.filter(mapping => mapping.id !== deleteDialog.id));
          setStats(prev => ({...prev, mappings: prev.mappings - 1}));
          break;
        default:
          break;
      }

      setDeleteDialog({ open: false, type: '', id: null, name: '' });
      fetchData(activeTab); // Refresh data
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Ошибка при удалении элемента');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, type: '', id: null, name: '' });
  };

  // Карточки статистики
  const StatCard = ({ title, value, icon, subtitle }) => (
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

  // Table component for each data type
  const DataTable = ({ headers, data, columns, onDelete, type }) => {
    // Устанавливаем минимальное количество строк для стабилизации высоты таблицы
    const minRows = 8; // Минимум 8 строк для стабильной высоты
    const displayData = data && data.length > 0 ? data : [];
    const paddingRows = Math.max(0, minRows - displayData.length);

    return (
      <TableContainer component={Paper}
        sx={{
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          maxHeight: '500px',
          '& .MuiTableCell-root': {
            color: 'rgba(255, 255, 255, 0.9)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index} sx={{ fontWeight: 'bold', color: '#8b5cf6' }}>
                  {header}
                </TableCell>
              ))}
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((item) => (
              <TableRow key={item.id} hover>
                {columns.map((col, index) => (
                  <TableCell key={index}>{item[col]}</TableCell>
                ))}
                <TableCell>
                  <IconButton
                    onClick={() => onDelete(type, item.id, item.name || item.email || `${item.id}`)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {/* Добавляем пустые строки для стабилизации высоты таблицы */}
            {Array.from({ length: paddingRows }).map((_, index) => (
              <TableRow key={`padding-${index}`} sx={{ height: '52px' }}>
                {Array.from({ length: headers.length + 1 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex} sx={{ border: 'none', background: 'transparent' }} />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Navigation tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }}>
        <Button
          onClick={() => setActiveTab('stats')}
          sx={{
            color: activeTab === 'stats' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.7)',
            fontWeight: activeTab === 'stats' ? 'bold' : 'normal',
            mr: 2,
            px: 2,
            py: 1,
            borderRadius: '8px',
            '&:hover': {
              background: 'rgba(139, 92, 246, 0.1)',
            }
          }}
        >
          Статистика
        </Button>
        <Button
          onClick={() => setActiveTab('users')}
          sx={{
            color: activeTab === 'users' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.7)',
            fontWeight: activeTab === 'users' ? 'bold' : 'normal',
            mr: 2,
            px: 2,
            py: 1,
            borderRadius: '8px',
            '&:hover': {
              background: 'rgba(139, 92, 246, 0.1)',
            }
          }}
        >
          Пользователи
        </Button>
        <Button
          onClick={() => setActiveTab('stores')}
          sx={{
            color: activeTab === 'stores' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.7)',
            fontWeight: activeTab === 'stores' ? 'bold' : 'normal',
            mr: 2,
            px: 2,
            py: 1,
            borderRadius: '8px',
            '&:hover': {
              background: 'rgba(139, 92, 246, 0.1)',
            }
          }}
        >
          Магазины
        </Button>
        <Button
          onClick={() => setActiveTab('products')}
          sx={{
            color: activeTab === 'products' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.7)',
            fontWeight: activeTab === 'products' ? 'bold' : 'normal',
            mr: 2,
            px: 2,
            py: 1,
            borderRadius: '8px',
            '&:hover': {
              background: 'rgba(139, 92, 246, 0.1)',
            }
          }}
        >
          Товары
        </Button>
        <Button
          onClick={() => setActiveTab('mappings')}
          sx={{
            color: activeTab === 'mappings' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.7)',
            fontWeight: activeTab === 'mappings' ? 'bold' : 'normal',
            px: 2,
            py: 1,
            borderRadius: '8px',
            '&:hover': {
              background: 'rgba(139, 92, 246, 0.1)',
            }
          }}
        >
          Сопоставления
        </Button>
      </Box>

      {/* Content based on active tab */}
      <Box sx={{ minHeight: '500px', position: 'relative' }}>
        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#8b5cf6' }} />
          </Box>
        )}

        {!loading && activeTab === 'stats' && (
          <>
            {/* Статистика */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Пользователи"
                  value={stats.users}
                  icon={<UsersIcon sx={{ fontSize: 40, color: '#f59e0b', mx: 'auto' }} />}
                  subtitle="Всего зарегистрировано"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Магазины"
                  value={stats.stores}
                  icon={<StoreIcon sx={{ fontSize: 40, color: '#3b82f6', mx: 'auto' }} />}
                  subtitle="Всего подключено"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Товары"
                  value={stats.products}
                  icon={<ProductsIcon sx={{ fontSize: 40, color: '#10b981', mx: 'auto' }} />}
                  subtitle="Всего в системе"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Сопоставления"
                  value={stats.mappings}
                  icon={<MappingsIcon sx={{ fontSize: 40, color: '#8b5cf6', mx: 'auto' }} />}
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
          </>
        )}

        {!loading && activeTab === 'users' && (
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              Управление пользователями
            </Typography>
            <DataTable
              headers={['ID', 'Email']}
              data={users}
              columns={['id', 'email']}
              onDelete={handleDeleteClick}
              type="user"
            />
          </Box>
        )}

        {!loading && activeTab === 'stores' && (
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              Управление магазинами
            </Typography>
            <DataTable
              headers={['ID', 'Пользователь', 'Тип']}
              data={stores}
              columns={['id', 'user_id', 'type']}
              onDelete={handleDeleteClick}
              type="store"
            />
          </Box>
        )}

        {!loading && activeTab === 'products' && (
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              Управление товарами
            </Typography>
            <DataTable
              headers={['ID', 'Магазин', 'Внешний ID', 'Название', 'Цена', 'Кол-во']}
              data={products}
              columns={['id', 'store_id', 'external_id', 'name', 'price', 'quantity']}
              onDelete={handleDeleteClick}
              type="product"
            />
          </Box>
        )}

        {!loading && activeTab === 'mappings' && (
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              Управление сопоставлениями
            </Typography>
            <DataTable
              headers={['ID', 'Товар 1', 'Товар 2', 'Пользователь']}
              data={mappings}
              columns={['id', 'product1_id', 'product2_id', 'user_id']}
              onDelete={handleDeleteClick}
              type="mapping"
            />
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>
          Подтверждение удаления
          <IconButton
            aria-label="close"
            onClick={handleDeleteCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить {deleteDialog.type === 'user' ? 'пользователя' :
            deleteDialog.type === 'store' ? 'магазин' :
            deleteDialog.type === 'product' ? 'товар' : 'сопоставление'}
            "{deleteDialog.name}"?
          </Typography>
          <Typography variant="caption" color="error">
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error">Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminDashboard;