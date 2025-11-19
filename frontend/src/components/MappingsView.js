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
  Divider,
  useTheme,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  mappingsAPI
} from '../services/api';
import {
  CompareArrows as CompareIcon,
  SwapHoriz as SwapIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import EmptyState from './EmptyState';

function MappingsView() {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMappingId, setSelectedMappingId] = useState(null);
  const theme = useTheme();

  // Используем useRef для отслеживания, размонтирован ли компонент
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchMappings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMappings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await mappingsAPI.getMappings();
      // Добавляем дополнительную проверку на случай, если структура ответа отличается
      if (response.data && response.data.mappings && isMountedRef.current) {
        setMappings(response.data.mappings);
      } else if (isMountedRef.current) {
        console.warn('Mappings not found in response, using empty array:', response.data);
        setMappings([]);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Failed to fetch mappings:', err);
        setError('Ошибка при загрузке сопоставлений');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (mappingId) => {
    try {
      await mappingsAPI.deleteMapping(mappingId);
      setMappings(mappings.filter(m => m.id !== mappingId));
    } catch (err) {
      console.error('Failed to delete mapping:', err);
      setError('Ошибка при удалении сопоставления');
    } finally {
      handleCloseMenu();
    }
  };

  const handleMenuOpen = (event, mappingId) => {
    setAnchorEl(event.currentTarget);
    setSelectedMappingId(mappingId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedMappingId(null);
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
      {mappings.length > 0 ? (
        <>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Сопоставление</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Wildberries</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ozon</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Средняя цена</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow
                    key={mapping.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                      }
                    }}
                  >
                    <TableCell>
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
                          <CompareIcon
                            sx={{
                              fontSize: 20,
                              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          #{mapping.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {mapping.product1?.name || 'N/A'}
                        </Typography>
                        <Chip
                          label={`WB: ${(mapping.product1?.price || 0)} ₽`}
                          size="small"
                          sx={{
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            mt: 1
                          }}
                          color="warning"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {mapping.product2?.name || 'N/A'}
                        </Typography>
                        <Chip
                          label={`Ozon: ${(mapping.product2?.price || 0)} ₽`}
                          size="small"
                          sx={{
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            mt: 1
                          }}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${Math.round(((mapping.product1?.price || 0) + (mapping.product2?.price || 0)) / 2)} ₽`}
                        color="success"
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="settings"
                        onClick={(e) => handleMenuOpen(e, mapping.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Карточки сопоставлений */}
          <Typography
            variant="h6"
            sx={{
              mt: 4,
              mb: 2,
              color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#333333'
            }}
            gutterBottom
          >
            Визуальное представление
          </Typography>
          <Grid container spacing={3}>
            {mappings.map((mapping) => (
              <Grid item xs={12} sm={6} md={4} key={mapping.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: theme.shadows[2],
                    backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#ffffff',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[6],
                    }
                  }}
                >
                  {/* Заголовок сопоставления */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`
                  }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '10px',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <CompareIcon
                        sx={{
                          fontSize: 24,
                          color: theme.palette.primary.main
                        }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#333333' }}
                    >
                      Сопоставление #{mapping.id}
                    </Typography>
                    <IconButton
                      aria-label="settings"
                      onClick={(e) => handleMenuOpen(e, mapping.id)}
                      sx={{
                        ml: 'auto',
                        color: theme.palette.text.secondary
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      {/* Товар Wildberries */}
                      <Card
                        sx={{
                          flex: 1,
                          mr: 1,
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark' ? '#333333' : '#fffde7',
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,152,0,0.3)' : 'rgba(255,152,0,0.2)'}`
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Typography
                            variant="subtitle2"
                            color="warning.main"
                            fontWeight="bold"
                            gutterBottom
                          >
                            Wildberries
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '6px',
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,152,0,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1
                              }}
                            >
                              <VisibilityIcon
                                sx={{
                                  fontSize: 18,
                                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(255,152,0,0.5)'
                                }}
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: '1.2em',
                                maxHeight: '2.4em'
                              }}
                            >
                              {mapping.product1?.name || 'N/A'}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h6"
                            color="warning.main"
                            fontWeight="bold"
                            sx={{ mt: 1 }}
                          >
                            {mapping.product1?.price || 0} ₽
                          </Typography>
                        </CardContent>
                      </Card>

                      {/* Иконка обмена */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 1
                      }}>
                        <SwapIcon
                          sx={{
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                            fontSize: 24
                          }}
                        />
                      </Box>

                      {/* Товар Ozon */}
                      <Card
                        sx={{
                          flex: 1,
                          ml: 1,
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark' ? '#333333' : '#e3f2fd',
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(25,118,210,0.3)' : 'rgba(25,118,210,0.2)'}`
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Typography
                            variant="subtitle2"
                            color="primary.main"
                            fontWeight="bold"
                            gutterBottom
                          >
                            Ozon
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '6px',
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(25,118,210,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1
                              }}
                            >
                              <VisibilityIcon
                                sx={{
                                  fontSize: 18,
                                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(25,118,210,0.5)'
                                }}
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: '1.2em',
                                maxHeight: '2.4em'
                              }}
                            >
                              {mapping.product2?.name || 'N/A'}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h6"
                            color="primary.main"
                            fontWeight="bold"
                            sx={{ mt: 1 }}
                          >
                            {mapping.product2?.price || 0} ₽
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Средняя цена */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.05)',
                        textAlign: 'center',
                        mt: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        <strong>Средняя цена:</strong>
                      </Typography>
                      <Typography
                        variant="h5"
                        color="success.main"
                        fontWeight="bold"
                      >
                        {Math.round(((mapping.product1?.price || 0) + (mapping.product2?.price || 0)) / 2)} ₽
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <EmptyState type="mappings" />
      )}

      {/* Меню действий над сопоставлением */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 0.5,
            boxShadow: theme.shadows[6]
          }
        }}
      >
        <MenuItem
          onClick={() => handleDelete(selectedMappingId)}
          sx={{
            color: 'error.main',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(244, 67, 54, 0.1)'
                : 'rgba(244, 67, 54, 0.04)'
            }
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Разъединить товары
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default MappingsView;