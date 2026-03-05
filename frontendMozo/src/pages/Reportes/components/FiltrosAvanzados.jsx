import React, { useEffect, useRef, useState } from 'react';
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
    Chip,
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
    const [isSticky, setIsSticky] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const prevFechasRef = useRef({ fechaInicio: '', fechaFin: '' });

    // Auto-cargar cuando ambas fechas están seleccionadas
    useEffect(() => {
        if (onBuscar && filtros.fechaInicio && filtros.fechaFin) {
            const prev = prevFechasRef.current;
            if (prev.fechaInicio !== filtros.fechaInicio || prev.fechaFin !== filtros.fechaFin) {
                prevFechasRef.current = { fechaInicio: filtros.fechaInicio, fechaFin: filtros.fechaFin };
                onBuscar();
            }
        }
    }, [filtros.fechaInicio, filtros.fechaFin]);
    const [stickyStyle, setStickyStyle] = useState({});
    const [cardHeight, setCardHeight] = useState(0);
    const cardRef = useRef(null);
    const containerRef = useRef(null);
    const scrollThresholdRef = useRef(null);
    const isStickyRef = useRef(false);

    useEffect(() => {
        const updateStickyStyle = () => {
            if (cardRef.current && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                setStickyStyle({
                    width: `${containerRect.width}px`,
                    left: `${containerRect.left}px`
                });
            }
        };

        const handleScroll = () => {
            if (scrollThresholdRef.current !== null) {
                const scrollY = window.scrollY || window.pageYOffset;
                const shouldBeSticky = scrollY >= scrollThresholdRef.current;

                if (shouldBeSticky !== isStickyRef.current) {
                    isStickyRef.current = shouldBeSticky;
                    setIsSticky(shouldBeSticky);
                    if (shouldBeSticky) {
                        updateStickyStyle();
                    }
                }
            }
        };

        const initialize = () => {
            if (cardRef.current) {
                // Calcular el threshold basado en la posición inicial del card
                const rect = cardRef.current.getBoundingClientRect();
                scrollThresholdRef.current = rect.top + window.scrollY - 16; // 16px de margen superior
                
                // Guardar altura del card solo una vez
                if (cardHeight === 0) {
                    setCardHeight(cardRef.current.offsetHeight);
                }
                
                // Encontrar el contenedor
                const parent = cardRef.current.closest('.MuiContainer-root') || 
                              cardRef.current.parentElement?.closest('.MuiContainer-root') ||
                              document.querySelector('main');
                if (parent) {
                    containerRef.current = parent;
                    updateStickyStyle();
                }
            }
        };

        const handleResize = () => {
            initialize();
            updateStickyStyle();
            handleScroll();
        };

        // Inicializar
        initialize();
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        
        // Verificar estado inicial
        handleScroll();
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [cardHeight]);
    const tiposReporte = [
        { value: 'ventas', label: 'Ventas' },
        { value: 'productos', label: 'Productos' },
        { value: 'mozos', label: 'Mozos' },
        { value: 'mesas', label: 'Mesas' },
        { value: 'rentabilidad', label: 'Rentabilidad' },
        { value: 'caja', label: 'Caja' }
    ];

    const estados = ['Pagado', 'Pendiente', 'Cancelado'];

    const stickyActive = isSticky && !collapsed;

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
        <>
            {/* Placeholder para mantener el espacio cuando está sticky */}
            {stickyActive && <Box sx={{ height: cardHeight || 0, mb: 4 }} />}

            <Card
                ref={cardRef}
                sx={{
                    position: stickyActive ? 'fixed' : 'relative',
                    top: stickyActive ? 16 : 'auto',
                    left: stickyActive ? stickyStyle.left : 'auto',
                    width: stickyActive ? stickyStyle.width : '100%',
                    zIndex: stickyActive ? 1000 : 1,
                    mb: 4,
                    boxShadow: stickyActive ? 6 : 4,
                    backgroundColor: 'background.paper',
                    transition: stickyActive ? 'none' : 'all 0.2s ease-in-out'
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

                    {/* Estados */}
                    <Grid item xs={12} md={6} lg={ocultarTipoReporte ? 4 : 3}>
                    <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Estados</InputLabel>
                            <Select
                                fullWidth
                                multiple
                                value={filtros.estados}
                                label="Estados"
                                onChange={(e) => actualizarFiltro('estados', e.target.value)}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {estados.map((estado) => (
                                    <MenuItem key={estado} value={estado}>
                                        {estado}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Mesas */}
                    <Grid item xs={12} md={6} lg={ocultarTipoReporte ? 4 : 3}>
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Mesas</InputLabel>
                            <Select
                                multiple
                                value={filtros.idMesas}
                                label="Mesas"
                                onChange={(e) => actualizarFiltro('idMesas', e.target.value)}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const mesa = mesas.find(m => m.id === value);
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={mesa ? mesa.nombre : value}
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {mesas.map((mesa) => (
                                    <MenuItem key={mesa.id} value={mesa.id}>
                                        {mesa.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Categorías */}
                    <Grid item xs={12} md={6} lg={ocultarTipoReporte ? 4 : 3}>
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Categorías</InputLabel>
                            <Select
                                multiple
                                value={filtros.idCategorias}
                                label="Categorías"
                                onChange={(e) => actualizarFiltro('idCategorias', e.target.value)}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const categoria = categorias.find(c => 
                                                c.id === value || c.id.toString() === value
                                            );
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={categoria ? categoria.nombre : value}
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {categorias.map((categoria) => (
                                    <MenuItem key={categoria.id} value={categoria.id.toString()}>
                                        {categoria.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Tipo de Pago */}
                    <Grid item xs={12} md={6} lg={ocultarTipoReporte ? 4 : 3}>
                        <FormControl sx={{ minWidth: 140 }}>
                            <InputLabel>Tipo de Pago</InputLabel>
                            <Select
                                multiple
                                value={filtros.idTipoPagos}
                                label="Tipo de Pago"
                                onChange={(e) => actualizarFiltro('idTipoPagos', e.target.value)}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const tipoPago = tipoPagos.find(tp => 
                                                tp.id.toString() === value
                                            );
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={tipoPago ? tipoPago.nombre : value}
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {tipoPagos.map((tipoPago) => (
                                    <MenuItem key={tipoPago.id} value={tipoPago.id.toString()}>
                                        {tipoPago.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
        </>
    );
};

export default FiltrosAvanzados;

