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
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
  InputAdornment,
  Pagination
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as ProductsIcon,
  Compare as MappingsIcon,
  People as UsersIcon,
  ExitToApp as LogoutIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ArrowUpward as SortUpIcon,
  ArrowDownward as SortDownIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { clearAdminToken } from '../redux/slices/authSlice';
import { adminManagementAPI } from '../services/api';

function AdminDashboard() {
  const adminToken = useAppSelector(state => state.auth.adminToken);
  const dispatch = useAppDispatch();
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

  // State for filters and sorting
  const [userFilter, setUserFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [mappingFilter, setMappingFilter] = useState('');

  // State for sorting
  const [userSort, setUserSort] = useState({ field: 'id', order: 'asc' });
  const [storeSort, setStoreSort] = useState({ field: 'id', order: 'asc' });
  const [productSort, setProductSort] = useState({ field: 'id', order: 'asc' });
  const [mappingSort, setMappingSort] = useState({ field: 'id', order: 'asc' });

  // State for pagination
  const [userPage, setUserPage] = useState(1);
  const [storePage, setStorePage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [mappingPage, setMappingPage] = useState(1);

  const itemsPerPage = 10; // Items per page

  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: '',
    id: null,
    name: ''
  });

  // Fetch stats and data
  useEffect(() => {
    // Проверяем наличие токена администратора
    if (!adminToken) {
      window.location.href = '/admin/login';
      return;
    }

    fetchStats();
    fetchData(activeTab);
  }, [activeTab, adminToken]);

  const fetchStats = async () => {
    try {
      const response = await adminManagementAPI.getStats(adminToken);
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
          const usersResponse = await adminManagementAPI.getUsers(adminToken);
          setUsers(usersResponse.data);
          break;
        case 'stores':
          const storesResponse = await adminManagementAPI.getStores(adminToken);
          setStores(storesResponse.data);
          break;
        case 'products':
          const productsResponse = await adminManagementAPI.getProducts(adminToken);
          setProducts(productsResponse.data);
          break;
        case 'mappings':
          const mappingsResponse = await adminManagementAPI.getMappings(adminToken);
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

  // Function to handle logout
  const handleLogout = () => {
    // Удаляем токен администратора из Redux-хранилища
    dispatch(clearAdminToken());
    // Перенаправляем на страницу входа в админку
    window.location.href = '/admin/login';
  };

  // Function to handle delete click
  const handleDeleteClick = (type, id, name) => {
    setDeleteDialog({
      open: true,
      type,
      id,
      name
    });
  };

  // Function to confirm deletion
  const handleDeleteConfirm = async () => {
    try {
      switch (deleteDialog.type) {
        case 'user':
          await adminManagementAPI.deleteUser(deleteDialog.id, adminToken);
          setUsers(users.filter(user => user.id !== deleteDialog.id));
          setStats(prev => ({...prev, users: prev.users - 1}));
          break;
        case 'store':
          await adminManagementAPI.deleteStore(deleteDialog.id, adminToken);
          setStores(stores.filter(store => store.id !== deleteDialog.id));
          setStats(prev => ({...prev, stores: prev.stores - 1}));
          break;
        case 'product':
          await adminManagementAPI.deleteProduct(deleteDialog.id, adminToken);
          setProducts(products.filter(product => product.id !== deleteDialog.id));
          setStats(prev => ({...prev, products: prev.products - 1}));
          break;
        case 'mapping':
          await adminManagementAPI.deleteMapping(deleteDialog.id, adminToken);
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

  // Function to cancel deletion
  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, type: '', id: null, name: '' });
  };

  // Function to handle sorting
  const handleSort = (setType, currentSort, field) => {
    setType(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Function to apply filters and sorting to the data
  const getSortedAndFilteredData = (type) => {
    let data = [];
    let filter = '';
    let sort = { field: 'id', order: 'asc' };

    switch (type) {
      case 'users':
        data = [...users];
        filter = userFilter;
        sort = userSort;
        break;
      case 'stores':
        data = [...stores];
        filter = storeFilter;
        sort = storeSort;
        break;
      case 'products':
        data = [...products];
        filter = productFilter;
        sort = productSort;
        break;
      case 'mappings':
        data = [...mappings];
        filter = mappingFilter;
        sort = mappingSort;
        break;
    }

    // Apply filter
    if (filter) {
      data = data.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    // Apply sorting
    data.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];

      if (sort.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return data;
  };

  // Get paginated data
  const getPaginatedData = (type) => {
    const sortedData = getSortedAndFilteredData(type);
    let page = 1;

    switch (type) {
      case 'users':
        page = userPage;
        break;
      case 'stores':
        page = storePage;
        break;
      case 'products':
        page = productPage;
        break;
      case 'mappings':
        page = mappingPage;
        break;
    }

    const startIndex = (page - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  };

  // Get total pages
  const getTotalPages = (type) => {
    const sortedData = getSortedAndFilteredData(type);
    return Math.ceil(sortedData.length / itemsPerPage);
  };

  // Function to handle page change
  const handlePageChange = (type, page) => {
    switch (type) {
      case 'users':
        setUserPage(page);
        break;
      case 'stores':
        setStorePage(page);
        break;
      case 'products':
        setProductPage(page);
        break;
      case 'mappings':
        setMappingPage(page);
        break;
    }
  };

  // Function to export data as CSV
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
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

  // Charts for statistics
  const ChartsSection = () => {
    // Mock data for charts - in a real app, this would come from the backend
    const userGrowthData = [
      { name: 'Янв', users: 10 },
      { name: 'Фев', users: 15 },
      { name: 'Мар', users: 22 },
      { name: 'Апр', users: 30 },
      { name: 'Май', users: 45 },
      { name: 'Июн', users: 60 },
    ];

    const entityDistributionData = [
      { name: 'Пользователи', value: stats.users },
      { name: 'Магазины', value: stats.stores },
      { name: 'Товары', value: stats.products },
      { name: 'Сопоставления', value: stats.mappings },
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              Рост пользователей
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={userGrowthData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  fill="rgba(139, 92, 246, 0.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              Распределение сущностей
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={entityDistributionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#colorUv)"
                  background={{ fill: 'rgba(255,255,255,0.05)' }}
                >
                  {entityDistributionData.map((entry, index) => (
                    <Bar
                      key={`bar-${index}`}
                      fill={
                        entry.name === 'Пользователи' ? '#f59e0b' :
                        entry.name === 'Магазины' ? '#3b82f6' :
                        entry.name === 'Товары' ? '#10b981' : '#8b5cf6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Table component for each data type
  const DataTable = ({ headers, data, columns, onDelete, type, sortConfig, onSort }) => {
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
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => onSort(type, sortConfig, columns[index])}
                  >
                    {header}
                    {sortConfig.field === columns[index] && (
                      sortConfig.order === 'asc' ?
                        <SortUpIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                        <SortDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
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

            {/* Charts */}
            <ChartsSection />

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Управление пользователями
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Поиск..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8b5cf6',
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: '7px',
                      px: '12px',
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => exportToCSV(users, 'users.csv')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Экспорт
                </Button>
              </Box>
            </Box>
            <DataTable
              headers={['ID', 'Email']}
              data={getPaginatedData('users')}
              columns={['id', 'email']}
              onDelete={handleDeleteClick}
              type="users"
              sortConfig={userSort}
              onSort={handleSort}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={getTotalPages('users')}
                page={userPage}
                onChange={(e, page) => handlePageChange('users', page)}
                color="primary"
              />
            </Box>
          </Box>
        )}

        {!loading && activeTab === 'stores' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Управление магазинами
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Поиск..."
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8b5cf6',
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: '7px',
                      px: '12px',
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => exportToCSV(stores, 'stores.csv')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Экспорт
                </Button>
              </Box>
            </Box>
            <DataTable
              headers={['ID', 'Пользователь', 'Тип']}
              data={getPaginatedData('stores')}
              columns={['id', 'user_id', 'type']}
              onDelete={handleDeleteClick}
              type="stores"
              sortConfig={storeSort}
              onSort={handleSort}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={getTotalPages('stores')}
                page={storePage}
                onChange={(e, page) => handlePageChange('stores', page)}
                color="primary"
              />
            </Box>
          </Box>
        )}

        {!loading && activeTab === 'products' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Управление товарами
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Поиск..."
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8b5cf6',
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: '7px',
                      px: '12px',
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => exportToCSV(products, 'products.csv')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Экспорт
                </Button>
              </Box>
            </Box>
            <DataTable
              headers={['ID', 'Магазин', 'Внешний ID', 'Название', 'Цена', 'Кол-во']}
              data={getPaginatedData('products')}
              columns={['id', 'store_id', 'external_id', 'name', 'price', 'quantity']}
              onDelete={handleDeleteClick}
              type="products"
              sortConfig={productSort}
              onSort={handleSort}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={getTotalPages('products')}
                page={productPage}
                onChange={(e, page) => handlePageChange('products', page)}
                color="primary"
              />
            </Box>
          </Box>
        )}

        {!loading && activeTab === 'mappings' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Управление сопоставлениями
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Поиск..."
                  value={mappingFilter}
                  onChange={(e) => setMappingFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8b5cf6',
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: '7px',
                      px: '12px',
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => exportToCSV(mappings, 'mappings.csv')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Экспорт
                </Button>
              </Box>
            </Box>
            <DataTable
              headers={['ID', 'Товар 1', 'Товар 2', 'Пользователь']}
              data={getPaginatedData('mappings')}
              columns={['id', 'product1_id', 'product2_id', 'user_id']}
              onDelete={handleDeleteClick}
              type="mappings"
              sortConfig={mappingSort}
              onSort={handleSort}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={getTotalPages('mappings')}
                page={mappingPage}
                onChange={(e, page) => handlePageChange('mappings', page)}
                color="primary"
              />
            </Box>
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