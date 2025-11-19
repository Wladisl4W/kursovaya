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
  CardMedia,
  Grid,
  CardActions,
  useTheme
} from '@mui/material';
import { productsAPI } from '../services/api';
import { CompareArrows as CompareIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import EmptyState from './EmptyState';

function ProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'table' or 'grid' - теперь по умолчанию сетка
  const theme = useTheme();

  // Используем useRef для отслеживания, размонтирован ли компонент
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await productsAPI.getProducts();
      // Добавляем дополнительную проверку на случай, если структура ответа отличается
      if (response.data && response.data.products && isMountedRef.current) {
        setProducts(response.data.products);
      } else if (isMountedRef.current) {
        console.warn('Products not found in response, using empty array:', response.data);
        setProducts([]);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Failed to fetch products:', err);
        setError('Ошибка при загрузке товаров');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
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

  // Карточка товара для режима сетки
  const ProductCard = ({ product }) => (
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
      {/* Заглушка для изображения товара */}
      <CardMedia
        sx={{
          height: 140,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        image="" // В реальном приложении здесь будет ссылка на изображение
        title={product.name}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '8px',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <VisibilityIcon
            sx={{
              fontSize: 32,
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
            }}
          />
        </Box>
      </CardMedia>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.4em',
              maxHeight: '2.8em'
            }}
          >
            {product.name}
          </Typography>
          <Chip
            label={product.store_type === 'wb' ? 'Wildberries' : 'Ozon'}
            size="small"
            sx={{
              ml: 1,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 500
            }}
            color={product.store_type === 'ozon' ? 'primary' : 'secondary'}
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="success.main"
            sx={{ display: 'inline-block' }}
          >
            {product.price} ₽
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            ID: {product.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.quantity} шт
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{
        justifyContent: 'space-between',
        px: 2,
        pt: 0
      }}>
        <Button
          size="small"
          startIcon={<CompareIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
          onClick={() => {
            // Логика сопоставления товара
          }}
        >
          Сопоставить
        </Button>
        <Button
          size="small"
          color="secondary"
          sx={{
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      {products.length > 0 ? (
        <>
          {viewMode === 'table' ? (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: theme.palette.mode === 'dark' ? '0px 4px 20px rgba(0, 0, 0, 0.4)' : '0px 4px 20px rgba(0, 0, 0, 0.08)',
                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold' }}>Товар</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Магазин</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Цена</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Количество</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow
                      key={product.id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                        }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '4px',
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}
                          >
                            <VisibilityIcon
                              sx={{
                                fontSize: 20,
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {product.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.store_type === 'wb' ? 'Wildberries' : 'Ozon'}
                          size="small"
                          sx={{
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                          color={product.store_type === 'ozon' ? 'primary' : 'secondary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          {product.price} ₽
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {product.quantity} шт
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CompareIcon />}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 500
                            }}
                          >
                            Сопоставить
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <EmptyState type="products" />
      )}
    </Box>
  );
}

export default ProductsView;