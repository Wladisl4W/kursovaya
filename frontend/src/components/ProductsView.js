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
  Alert,
  Typography,
  Chip
} from '@mui/material';
import axios from 'axios';

function ProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Здесь будет запрос к API для получения товаров
      // const response = await axios.get('/api/products');
      // setProducts(response.data);
      
      // Пока используем mock данные
      setProducts([
        { id: 1, name: 'Кроссовки мужские', store: 'wb', price: 2990, quantity: 15 },
        { id: 2, name: 'Куртка зимняя', store: 'ozon', price: 5990, quantity: 8 },
        { id: 3, name: 'Футболка', store: 'wb', price: 990, quantity: 42 }
      ]);
    } catch (err) {
      setError('Ошибка при загрузке товаров');
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
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
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Товары из всех магазинов</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Магазин</TableCell>
              <TableCell>Цена</TableCell>
              <TableCell>Количество</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={product.store === 'wb' ? 'Wildberries' : 'Ozon'} 
                    color={product.store === 'wb' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{product.price} ₽</TableCell>
                <TableCell>{product.quantity} шт</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small"
                  >
                    Сопоставить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ProductsView;