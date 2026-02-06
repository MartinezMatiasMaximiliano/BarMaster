import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Stack,
    Box,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { ListaProductosDisponibles, ListaProductosEnMenu } from './components/ListaProductosMenu';
import { useSnackbar } from '../../../hooks/useSnackbar.jsx';
import { SnackbarWrapper } from '../../common/SnackbarWrapper';

export default function Modal_GestionarProductosMenu({
    open,
    onClose,
    menu,
    productos = [],
    categorias = [],
    recargar
}) {
    const { showSnackbar, SnackbarComponent } = useSnackbar();

    // Obtener IDs de productos que ya están en el menú (del backend)
    const idsProductosEnMenuInicial = useMemo(() => {
        if (!menu?.productos || !Array.isArray(menu.productos)) return [];
        return menu.productos.map(p => p.id || p.Id);
    }, [menu]);

    // Estado local de productos en el menú (puede cambiar al hacer click)
    const [idsProductosEnMenu, setIdsProductosEnMenu] = useState(idsProductosEnMenuInicial);

    // Actualizar estado cuando cambie el menú
    useEffect(() => {
        setIdsProductosEnMenu(idsProductosEnMenuInicial);
    }, [idsProductosEnMenuInicial]);

    // Separar productos en disponibles y en menú
    const { productosDisponibles, productosEnMenu } = useMemo(() => {
        const enMenu = productos.filter(p => {
            const productoId = p.id || p.Id;
            return idsProductosEnMenu.includes(productoId);
        });
        const disponibles = productos.filter(p => {
            const productoId = p.id || p.Id;
            return !idsProductosEnMenu.includes(productoId);
        });
        return {
            productosDisponibles: disponibles,
            productosEnMenu: enMenu
        };
    }, [productos, idsProductosEnMenu]);

    // Manejar agregar producto al menú (click en lista izquierda)
    const handleAgregarProducto = useCallback((productoId) => {
        setIdsProductosEnMenu(prev => {
            if (!prev.includes(productoId)) {
                return [...prev, productoId];
            }
            return prev;
        });
    }, []);

    // Manejar quitar producto del menú (click en lista derecha)
    const handleQuitarProducto = useCallback((productoId) => {
        setIdsProductosEnMenu(prev => prev.filter(id => id !== productoId));
    }, []);

    // Limpiar estado al cerrar
    const handleClose = useCallback(() => {
        setIdsProductosEnMenu(idsProductosEnMenuInicial);
        onClose();
    }, [onClose, idsProductosEnMenuInicial]);

    // Manejar guardar cambios (sin funcionalidad por ahora)
    const handleGuardar = useCallback(() => {
        // TODO: Implementar cuando estén listos los endpoints
        showSnackbar('Esta funcionalidad estará disponible próximamente', 'info');
    }, [showSnackbar]);

    if (!menu) {
        return null;
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
                disableEnforceFocus
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <RestaurantMenuIcon color="primary" />
                            <Typography variant="h6">
                                Gestionar productos - {menu.nombre}
                            </Typography>
                        </Stack>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} sx={{ height: 500 }}>
                        {/* Lista izquierda: Productos disponibles */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                                Productos disponibles ({productosDisponibles.length})
                            </Typography>
                            <ListaProductosDisponibles
                                productos={productosDisponibles}
                                categorias={categorias}
                                onAgregarProducto={handleAgregarProducto}
                            />
                        </Box>

                        <Divider orientation="vertical" flexItem />

                        {/* Lista derecha: Productos en el menú */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                                Productos en el menú ({productosEnMenu.length})
                            </Typography>
                            <ListaProductosEnMenu
                                productos={productosEnMenu}
                                categorias={categorias}
                                onQuitarProducto={handleQuitarProducto}
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGuardar}
                        size="small"
                    >
                        Guardar cambios
                    </Button>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        size="small"
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
            <SnackbarComponent />
        </>
    );
}
