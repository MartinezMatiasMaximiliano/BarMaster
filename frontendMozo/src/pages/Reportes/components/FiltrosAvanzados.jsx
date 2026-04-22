import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Stack,
    Grid,
    IconButton,
    Tooltip
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';

const FiltrosAvanzados = ({ filtros, actualizarFiltro, limpiarFiltros, mesas, categorias, tipoPagos, ocultarTipoReporte = false, onBuscar, onHistorico }) => {
    const [collapsed, setCollapsed] = useState(false);
    const tiposReporte = [
        { value: 'ventas', label: 'Ventas' },
        { value: 'productos', label: 'Productos' },
        { value: 'mozos', label: 'Mozos' },
        { value: 'mesas', label: 'Mesas' },
        { value: 'rentabilidad', label: 'Rentabilidad' },
        { value: 'caja', label: 'Caja' }
    ];

    if (collapsed) {
        return (
            <Card sx={{ mb: 4, boxShadow: 1 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body1" color="text.secondary">
                                Filtros ocultos
                            </Typography>
                        </Box>
                        <Tooltip title="Mostrar filtros">
                            <IconButton size="small" onClick={() => setCollapsed(false)}>
                                <FilterListIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            sx={{
                position: 'sticky',
                top: 16,
                zIndex: 10,
                mb: 4,
                boxShadow: 4,
                backgroundColor: 'background.paper'
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="div">
                            Filtros
                        </Typography>
                    </Box>
                    <Tooltip title="Ocultar filtros">
                        <IconButton size="small" onClick={() => setCollapsed(true)}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Grid container spacing={3}>
                    {/* Tipo de Reporte - Solo mostrar si no está oculto */}
                    {!ocultarTipoReporte && (
                        <Grid item xs={12} md={6} lg={3}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Reporte</InputLabel>
                                <Select
                                    value={filtros.tipoReporte}
                                    label="Tipo de Reporte"
                                    onChange={(e) => actualizarFiltro('tipoReporte', e.target.value)}
                                >
                                    {tiposReporte.map((tipo) => (
                                        <MenuItem key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}

                    {/* Fecha Inicio */}
                    <Grid item xs={12} md={6} lg={ocultarTipoReporte ? 4 : 3}>
                        <TextField
                            fullWidth
                            label="Fecha Inicio"
                            type="date"
                            value={filtros.fechaInicio}
                            onChange={(e) => actualizarFiltro('fechaInicio', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Fecha Fin */}
                    <Grid item xs={12} md={6} lg={ocultarTipoReporte ? 4 : 3}>
                        <TextField
                            fullWidth
                            label="Fecha Fin"
                            type="date"
                            value={filtros.fechaFin}
                            onChange={(e) => actualizarFiltro('fechaFin', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>

                {/* Botones */}
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    {onHistorico && (
                        <Button
                            variant="outlined"
                            startIcon={<HistoryIcon />}
                            onClick={onHistorico}
                        >
                            Histórico
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={limpiarFiltros}
                    >
                        Limpiar Filtros
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default FiltrosAvanzados;

