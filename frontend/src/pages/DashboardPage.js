import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Tabs, 
  Tab, 
  Paper 
} from '@mui/material';
import { useAuth } from '../utils/AuthContext';
import AddStoreDialog from '../components/AddStoreDialog';
import StoresList from '../components/StoresList';
import ProductsView from '../components/ProductsView';
import MappingsView from '../components/MappingsView';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [showAddStore, setShowAddStore] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Добро пожаловать, {user?.email}!
        </Typography>
        <Button variant="outlined" onClick={logout}>
          Выйти
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Магазины" />
          <Tab label="Товары" />
          <Tab label="Сопоставления" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button 
                variant="contained" 
                onClick={() => setShowAddStore(true)}
              >
                Добавить магазин
              </Button>
            </Box>
            <StoresList />
          </Box>
        )}
        {activeTab === 1 && <ProductsView />}
        {activeTab === 2 && <MappingsView />}
      </Box>

      <AddStoreDialog 
        open={showAddStore} 
        onClose={() => setShowAddStore(false)} 
      />
    </Container>
  );
}

export default DashboardPage;