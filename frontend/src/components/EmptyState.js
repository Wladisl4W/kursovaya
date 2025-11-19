import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as ProductsIcon,
  Compare as MappingsIcon,
  Add as AddIcon
} from '@mui/icons-material';

function EmptyState({ type, onAddClick }) {
  const theme = useTheme();

  // Определяем текст и иконку в зависимости от типа
  const config = {
    stores: {
      title: 'Ваши магазины',
      subtitle: 'Нет подключенных магазинов',
      description: 'Добавьте Wildberries или Ozon магазин для начала работы',
      icon: <StoreIcon sx={{ fontSize: 60, color: 'action.active' }} />,
      buttonText: 'Добавить магазин',
      buttonColor: 'primary'
    },
    products: {
      title: 'Товары из маркетплейсов',
      subtitle: 'Нет товаров',
      description: 'Подключите магазин, чтобы получить список товаров',
      icon: <ProductsIcon sx={{ fontSize: 60, color: 'action.active' }} />,
      buttonText: 'Добавить магазин',
      buttonColor: 'primary'
    },
    mappings: {
      title: 'Объединенные товары',
      subtitle: 'Нет объединенных товаров',
      description: 'Сопоставьте товары из разных маркетплейсов, чтобы видеть их объединенную статистику',
      icon: <MappingsIcon sx={{ fontSize: 60, color: 'action.active' }} />,
      buttonText: 'Сопоставить товары',
      buttonColor: 'secondary'
    }
  };

  const { title, subtitle, description, icon, buttonText, buttonColor } = config[type];

  return (
    <Box>
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
          {icon}
          <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
            {subtitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default EmptyState;