import React from 'react';
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
  Alert,
  Typography,
  Chip
} from '@mui/material';

function MappingsView() {
  // В реальности здесь будут данные из API
  const mappings = [
    { 
      id: 1, 
      product1: { name: 'Кроссовки мужские', store: 'wb', price: 2990 }, 
      product2: { name: 'Кроссовки мужские', store: 'ozon', price: 3190 } 
    }
  ];

  const error = ''; // Здесь может быть ошибка от API

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Объединенные товары</Typography>
      {mappings.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Товар на WB</TableCell>
                <TableCell>Товар на Ozon</TableCell>
                <TableCell>Общая статистика</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{mapping.product1.name}</Typography>
                      <Chip 
                        label={`WB: ${mapping.product1.price} ₽`} 
                        color="primary" 
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{mapping.product2.name}</Typography>
                      <Chip 
                        label={`Ozon: ${mapping.product2.price} ₽`} 
                        color="secondary" 
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`Средняя цена: ${Math.round((mapping.product1.price + mapping.product2.price) / 2)} ₽`} 
                      color="default" 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small"
                    >
                      Расcоединить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">Пока нет объединенных товаров</Alert>
      )}
    </Box>
  );
}

export default MappingsView;