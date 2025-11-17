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

function AddStoreDialog({ open, onClose }) {
  const [storeType, setStoreType] = useState('wb');
  const [apiToken, setApiToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiToken.trim()) {
      setError('API токен обязателен');
      return;
    }

    try {
      // Здесь будет запрос к API для добавления магазина
      // await addStore(storeType, apiToken);
      console.log('Добавление магазина:', { storeType, apiToken });
      
      // Закрываем диалог и сбрасываем форму
      setApiToken('');
      setError('');
      onClose();
    } catch (err) {
      setError('Ошибка при добавлении магазина');
    }
  };

  const handleClose = () => {
    setApiToken('');
    setError('');
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
          <Button onClick={handleClose}>Отмена</Button>
          <Button type="submit">Добавить</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default AddStoreDialog;