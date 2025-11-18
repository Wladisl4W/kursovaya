import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { storesAPI } from '../services/api';

function AddStoreDialog({ open, onClose, onAdded }) {
  const [storeType, setStoreType] = useState('wb');
  const [apiToken, setApiToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apiToken.trim()) {
      setError('API токен обязателен');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await storesAPI.addStore(storeType, apiToken);

      // Сбрасываем форму и закрываем диалог
      setApiToken('');
      setError('');

      // Вызываем callback для обновления списка магазинов
      if (onAdded) {
        onAdded();
      }

      onClose();
    } catch (err) {
      console.error('Failed to add store:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Ошибка при добавлении магазина');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setApiToken('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить магазин</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <FormControl fullWidth margin="normal">
            <InputLabel>Тип магазина</InputLabel>
            <Select
              value={storeType}
              label="Тип магазина"
              onChange={(e) => setStoreType(e.target.value)}
            >
              <MenuItem value="wb">Wildberries</MenuItem>
              <MenuItem value="ozon">Ozon</MenuItem>
            </Select>
          </FormControl>

          <TextField
            autoFocus
            margin="normal"
            label="API токен"
            fullWidth
            variant="outlined"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            type="password"
            helperText="Введите API токен от маркетплейса"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Отмена</Button>
          <Button type="submit" disabled={loading}>Добавить</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default AddStoreDialog;