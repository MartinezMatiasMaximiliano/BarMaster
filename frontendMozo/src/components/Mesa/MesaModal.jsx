// components/Mesa/MesaModal.jsx
import React, { useState, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Typography,
    Stack,
    Box,
    IconButton,
    Tab,
    Tabs
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import Modal_Generico from "../Modals/Modal_Generico";
import Modal_AgregarPedidos from "../Modals/Agregar_Pedidos/Modal_AgregarPedidos";
import { formatearFecha } from './dateFormatter';
import { useSnackbar } from '../../hooks/useSnackbar.jsx';
import { useModalVerCuenta } from '../Modals/Modal_Ver_Cuenta/hooks/useModalVerCuenta';
import TabContent from '../Modals/Modal_Ver_Cuenta/components/TabContent';
import { SnackbarWrapper } from '../common/SnackbarWrapper';

export const MesaModal = ({
    show,
    handleClose,
    datos_mesa,
    visitaMesa,
    checkBoxSeleccionados,
    handleChangeCheckBox,
    activarCancelarPedido,
    onCancelarPedidos,
    onCerrarMesa
}) => {
    const [showAgregarPedidos, setShowAgregarPedidos] = useState(false);
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    
    // Hook para manejar la lógica de ver cuenta
    const {
        tabValue,
        visitaMesa: visitaMesaCuenta,
        productosAPagar,
        totalPedidos,
        cantidadItems,
        currencyFormatter,
        handleTabChange,
        PagarMesa
    } = useModalVerCuenta(datos_mesa, handleClose);

    // Estado para productos seleccionados en el resumen (para facturar por partes)
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);

    // Estado para Snackbar de facturación
    const [snackbarFacturacion, setSnackbarFacturacion] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    // Usar visitaMesaCuenta del hook si está disponible, sino usar la prop
    const visitaMesaFinal = visitaMesaCuenta || visitaMesa;
    
    const fechaFormateada = formatearFecha(visitaMesaFinal?.fechaHora || datos_mesa.visita?.fechaHora);

    // Función para mostrar Snackbar de facturación
    const showSnackbarFacturacion = useCallback((message, severity = 'info') => {
        setSnackbarFacturacion({
            open: true,
            message,
            severity
        });
    }, []);

    // Cerrar Snackbar de facturación
    const handleCloseSnackbarFacturacion = useCallback(() => {
        setSnackbarFacturacion(prev => ({ ...prev, open: false }));
    }, []);

    // Manejar selección/deselección de productos
    const handleToggleProducto = useCallback((productoId) => {
        setProductosSeleccionados(prev => {
            if (prev.includes(productoId)) {
                return prev.filter(id => id !== productoId);
            } else {
                return [...prev, productoId];
            }
        });
    }, []);

    // Manejar facturación por partes
    const handleFacturarPorPartes = useCallback(() => {
        if (productosSeleccionados.length === 0) {
            showSnackbarFacturacion("Por favor, seleccione al menos un producto para facturar", "warning");
            return;
        }
        PagarMesa(productosSeleccionados, showSnackbarFacturacion);
        setProductosSeleccionados([]);
    }, [productosSeleccionados, PagarMesa, showSnackbarFacturacion]);

    // Wrapper para PagarMesa que incluye showSnackbar
    const handlePagarMesa = useCallback((arregloIds) => {
        PagarMesa(arregloIds, showSnackbarFacturacion);
    }, [PagarMesa, showSnackbarFacturacion]);

    // Limpiar selección al cerrar el modal
    const handleCloseWithCleanup = useCallback(() => {
        setProductosSeleccionados([]);
        handleClose();
    }, [handleClose]);

    // Wrapper para onCancelarPedidos que muestra Snackbar
    const handleCancelarPedidosConSnackbar = useCallback((idsProductos) => {
        if (!idsProductos || idsProductos.length === 0) {
            showSnackbar('Por favor, seleccione al menos un pedido para cancelar', 'warning');
            return;
        }
        
        // Ejecutar la función original
        onCancelarPedidos(idsProductos);
        
        // Limpiar selección después de cancelar
        setProductosSeleccionados([]);
        
        // Mostrar Snackbar de éxito
        const cantidad = idsProductos.length;
        showSnackbar(
            `Se ${cantidad === 1 ? 'canceló' : 'cancelaron'} ${cantidad} ${cantidad === 1 ? 'pedido' : 'pedidos'} correctamente`,
            'success'
        );
    }, [onCancelarPedidos, showSnackbar]);

    return (
        <Dialog 
            open={show} 
            onClose={handleCloseWithCleanup}
            maxWidth="md"
            fullWidth
            disableEnforceFocus
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarTodayIcon color="action" />
                            <Typography variant="h6" color="text.secondary" component="span">
                                {fechaFormateada}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TableRestaurantIcon color="primary" />
                            <Typography variant="h6" component="span">
                                Mesa {datos_mesa.nombre}
                            </Typography>
                        </Stack>
                        {datos_mesa.codigoParaPedir && (
                            <Alert
                                icon={<VpnKeyIcon />}
                                severity="warning"
                                sx={{ fontSize: '1.2rem', py: 0.5, px: 1 }}
                            >
                                {datos_mesa.codigoParaPedir}
                            </Alert>
                        )}
                    </Stack>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseWithCleanup}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2, flexShrink: 0 }}
                >
                    <Tab
                        label="Resumen"
                        icon={<RestaurantMenuIcon />}
                        iconPosition="start"
                    />
                    <Tab
                        label="Tickets abiertos"
                        icon={<ReceiptIcon />}
                        iconPosition="start"
                        disabled={!visitaMesaFinal}
                    />
                    <Tab
                        label="Pagos registrados"
                        icon={<CheckCircleIcon />}
                        iconPosition="start"
                        disabled={!visitaMesaFinal}
                    />
                </Tabs>

                <Box sx={{ 
                    p: 3, 
                    flex: '1 1 auto',
                    minHeight: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {tabValue === 0 && (
                        <TabContent
                            visitaMesa={visitaMesaFinal}
                            estado={false}
                            titulo="Pedido total"
                            subtitulo="Total"
                            mostrarCheckboxes={true}
                            productosSeleccionados={productosSeleccionados}
                            onToggleProducto={handleToggleProducto}
                            currencyFormatter={currencyFormatter}
                        />
                    )}

                    {tabValue === 1 && (
                        <TabContent
                            visitaMesa={visitaMesaFinal}
                            estado={1}
                            titulo="Ticket"
                            PagarMesa={handlePagarMesa}
                            facturar={true}
                        />
                    )}

                    {tabValue === 2 && (
                        <TabContent
                            visitaMesa={visitaMesaFinal}
                            estado={2}
                            titulo="Pagado"
                            subtitulo="Subtotal"
                        />
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 4, py: 2, flexDirection: 'column', alignItems: 'stretch', gap: 1.5 }}>
                {/* Primera fila: Agregar Productos, Cerrar mesa, Cancelar pedidos, y Cerrar */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AddShoppingCartIcon />}
                            onClick={() => setShowAgregarPedidos(true)}
                            size="small"
                            sx={{ 
                                py: 0.75,
                                fontSize: '0.875rem',
                                minWidth: 'auto'
                            }}
                        >
                            Agregar Productos
                        </Button>

                        <Modal_Generico
                            confirmar={true}
                            titulo="¿Seguro que desea cerrar la mesa?"
                            cuerpo="Todos los pedidos pendientes se marcarán como pagados"
                            textoBoton="Cerrar mesa"
                            func={onCerrarMesa}
                            param={datos_mesa.id}
                            cerrar_modal={handleCloseWithCleanup}
                            disabled={false}
                            buttonSize="small"
                        />

                        <Modal_Generico
                            confirmar={true}
                            titulo="Cancelar pedidos"
                            cuerpo="¿Seguro que desea cancelar los pedidos?"
                            textoBoton={`Cancelar pedidos${productosSeleccionados.length > 0 ? ` (${productosSeleccionados.length})` : ''}`}
                            func={handleCancelarPedidosConSnackbar}
                            param={productosSeleccionados}
                            cerrar_modal={handleCloseWithCleanup}
                            disabled={productosSeleccionados.length === 0}
                            buttonSize="small"
                        />
                    </Box>
                    <Button 
                        onClick={handleCloseWithCleanup} 
                        variant="outlined"
                        size="small"
                        sx={{
                            py: 0.75,
                            fontSize: '0.875rem',
                            minWidth: 'auto'
                        }}
                    >
                        Cerrar
                    </Button>
                </Box>

                {/* Segunda fila: Facturar todo y Facturar por partes */}
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, 'margin-left': "0 !important"}}>
                    <Modal_Generico
                        textoBoton="Facturar todo"
                        titulo="Facturar todo"
                        cuerpo="¿Confirmar el pago de todos los productos pendientes?"
                        confirmar={true}
                        func={handlePagarMesa}
                        param={productosAPagar}
                        disabled={!(productosAPagar.length > 0)}
                        color="success"
                        buttonSize="small"
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFacturarPorPartes}
                        disabled={productosSeleccionados.length === 0}
                        startIcon={<PlaylistAddCheckIcon />}
                        size="small"
                        sx={{
                            py: 0.75,
                            fontSize: '0.875rem',
                            minWidth: 'auto'
                        }}
                    >
                        Facturar por partes {productosSeleccionados.length > 0 && `(${productosSeleccionados.length})`}
                    </Button>
                </Box>
            </DialogActions>

            {/* Modal para agregar pedidos */}
            <Modal_AgregarPedidos
                open={showAgregarPedidos}
                onClose={() => setShowAgregarPedidos(false)}
                idVisita={datos_mesa.visita?.id}
                numeroMesa={datos_mesa.nombre}
            />

            {/* Snackbar para notificaciones */}
            <SnackbarComponent />
            
            {/* Snackbar para notificaciones de facturación */}
            <SnackbarWrapper
                open={snackbarFacturacion.open}
                message={snackbarFacturacion.message}
                severity={snackbarFacturacion.severity}
                onClose={handleCloseSnackbarFacturacion}
            />
        </Dialog>
    );
};