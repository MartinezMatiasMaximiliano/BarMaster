import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    TextField,
    Stack,
    Autocomplete,
    Paper
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Componente para mostrar productos disponibles (lista izquierda)
export const ListaProductosDisponibles = ({ 
    productos, 
    categorias = [],
    onAgregarProducto
}) => {
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState(null);

    // Filtrar productos
    const productosFiltrados = useMemo(() => {
        let filtrados = productos || [];

        if (busqueda) {
            filtrados = filtrados.filter(p =>
                (p.nombre || p.Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                (p.descripcion || p.Descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        if (categoriaFiltro) {
            filtrados = filtrados.filter(p => {
                if (!p.categorias || !Array.isArray(p.categorias)) return false;
                const nombreCategoria = categoriaFiltro.Nombre || categoriaFiltro.nombre;
                return p.categorias.includes(nombreCategoria);
            });
        }

        return filtrados;
    }, [productos, busqueda, categoriaFiltro]);

    if (!productos || productos.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No hay productos disponibles
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Filtros */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Autocomplete
                    freeSolo
                    options={productos.map(p => p.nombre || p.Nombre || '')}
                    value={busqueda}
                    onInputChange={(event, newValue) => setBusqueda(newValue || '')}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Buscar"
                            variant="outlined"
                            size="small"
                        />
                    )}
                    sx={{ flex: 1 }}
                />
                {categorias && categorias.length > 0 && (
                    <Autocomplete
                        options={categorias}
                        getOptionLabel={(option) => option?.Nombre || option?.nombre || ''}
                        value={categoriaFiltro}
                        onChange={(event, newValue) => setCategoriaFiltro(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Categoría"
                                variant="outlined"
                                size="small"
                            />
                        )}
                        sx={{ width: 200 }}
                        isOptionEqualToValue={(option, value) => option?.Id === value?.Id}
                    />
                )}
            </Stack>

            {/* Lista de productos */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1
                }}
            >
                {productosFiltrados.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No se encontraron productos
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={0.5}>
                        {productosFiltrados.map((producto) => {
                            const productoId = producto.id || producto.Id;
                            const productoNombre = producto.nombre || producto.Nombre || '';
                            const productoDescripcion = producto.descripcion || producto.Descripcion || '';
                            const productoPrecio = producto.precio || producto.Precio || 0;

                            return (
                                <Paper
                                    key={productoId}
                                    elevation={0}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            borderColor: 'primary.main',
                                            cursor: 'pointer'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => onAgregarProducto(productoId)}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                        <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {productoNombre}
                                            </Typography>
                                            {productoDescripcion && (
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: 'text.secondary',
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {productoDescripcion}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 2, flexShrink: 0 }}>
                                            ${productoPrecio}
                                        </Typography>
                                        <ArrowForwardIcon fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

// Componente para mostrar productos en el menú (lista derecha)
export const ListaProductosEnMenu = ({ 
    productos, 
    categorias = [],
    onQuitarProducto
}) => {
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState(null);

    // Filtrar productos
    const productosFiltrados = useMemo(() => {
        let filtrados = productos || [];

        if (busqueda) {
            filtrados = filtrados.filter(p =>
                (p.nombre || p.Nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                (p.descripcion || p.Descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        if (categoriaFiltro) {
            filtrados = filtrados.filter(p => {
                if (!p.categorias || !Array.isArray(p.categorias)) return false;
                const nombreCategoria = categoriaFiltro.Nombre || categoriaFiltro.nombre;
                return p.categorias.includes(nombreCategoria);
            });
        }

        return filtrados;
    }, [productos, busqueda, categoriaFiltro]);

    if (!productos || productos.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No hay productos en el menú
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Filtros */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Autocomplete
                    freeSolo
                    options={productos.map(p => p.nombre || p.Nombre || '')}
                    value={busqueda}
                    onInputChange={(event, newValue) => setBusqueda(newValue || '')}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Buscar"
                            variant="outlined"
                            size="small"
                        />
                    )}
                    sx={{ flex: 1 }}
                />
                {categorias && categorias.length > 0 && (
                    <Autocomplete
                        options={categorias}
                        getOptionLabel={(option) => option?.Nombre || option?.nombre || ''}
                        value={categoriaFiltro}
                        onChange={(event, newValue) => setCategoriaFiltro(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Categoría"
                                variant="outlined"
                                size="small"
                            />
                        )}
                        sx={{ width: 200 }}
                        isOptionEqualToValue={(option, value) => option?.Id === value?.Id}
                    />
                )}
            </Stack>

            {/* Lista de productos */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1
                }}
            >
                {productosFiltrados.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No se encontraron productos
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={0.5}>
                        {productosFiltrados.map((producto) => {
                            const productoId = producto.id || producto.Id;
                            const productoNombre = producto.nombre || producto.Nombre || '';
                            const productoDescripcion = producto.descripcion || producto.Descripcion || '';
                            const productoPrecio = producto.precio || producto.Precio || 0;

                            return (
                                <Paper
                                    key={productoId}
                                    elevation={0}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'action.selected',
                                        '&:hover': {
                                            bgcolor: 'error.light',
                                            borderColor: 'error.main',
                                            cursor: 'pointer'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => onQuitarProducto(productoId)}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                        <ArrowBackIcon fontSize="small" color="error" sx={{ mr: 1, flexShrink: 0 }} />
                                        <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {productoNombre}
                                            </Typography>
                                            {productoDescripcion && (
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: 'text.secondary',
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {productoDescripcion}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', ml: 2, flexShrink: 0 }}>
                                            ${productoPrecio}
                                        </Typography>
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};
