import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import axios from 'axios';

function StoresList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      // Здесь будет запрос к API для получения магазинов пользователя
      // const response = await axios.get('/api/stores');
      // setStores(response.data);
      
      // Пока используем mock данные
      setStores([
        { id: 1, type: 'wb', createdAt: '2023-01-15' },
        { id: 2, type: 'ozon', createdAt: '2023-01-16' }
      ]);
    } catch (err) {
      setError('Ошибка при загрузке магазинов');
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storeId) => {
    try {
      // Здесь будет запрос к API для удаления магазина
      // await axios.delete(`/api/stores/${storeId}`);
      setStores(stores.filter(store => store.id !== storeId));
    } catch (err) {
      setError('Ошибка при удалении магазина');
    }
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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Тип</TableCell>
            <TableCell>Дата добавления</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stores.map((store) => (
            <TableRow key={store.id}>
              <TableCell>{store.id}</TableCell>
              <TableCell>
                {store.type === 'wb' ? 'Wildberries' : 'Ozon'}
              </TableCell>
              <TableCell>{store.createdAt}</TableCell>
              <TableCell>
                <Button 
                  variant="outlined" 
                  color="error"
                  size="small"
                  onClick={() => handleDelete(store.id)}
                >
                  Удалить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default StoresList;