// components/Mesa/MesaModal.jsx
import React, { useState, useCallback, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Stack,
    Box,
    IconButton,
    Tab,
    Tabs,
    Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Modal_Generico from "../Modals/Modal_Generico";
import Modal_AgregarPedidos from "../Modals/Agregar_Pedidos/Modal_AgregarPedidos";
import Modal_Facturar from "../Modals/Modal_Facturar/Modal_Facturar";
import { formatearFecha } from './dateFormatter';
import { useSnackbar } from '../../hooks/useSnackbar.jsx';
import { useModalVerCuenta } from '../Modals/Modal_Ver_Cuenta/hooks/useModalVerCuenta';
import TabContent from '../Modals/Modal_Ver_Cuenta/components/TabContent';
import { boxDividerLine } from '../../styles/boxStyles';
import { SnackbarWrapper } from '../common/SnackbarWrapper';

export const MesaModal = ({
    show,
    handleClose,
    datos_mesa,
    visitaMesa,
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
        currencyFormatter,
        handleTabChange,
        PagarMesa
    } = useModalVerCuenta(datos_mesa, handleClose, { tabIndexPagosRegistrados: 1 });

    // Estado para productos seleccionados en el resumen (para facturar por partes)
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    // Modal facturar: null | 'todo' | 'partes'
    const [showModalFacturar, setShowModalFacturar] = useState(null);

    // Estado para Snackbar de facturación
    const [snackbarFacturacion, setSnackbarFacturacion] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    // Usar visitaMesaCuenta del hook si está disponible, sino usar la prop
    const visitaMesaFinal = visitaMesaCuenta || visitaMesa;

    // Total de los productos seleccionados (para facturar por partes)
    const totalPartes = useMemo(() => {
        if (!visitaMesaFinal?.productosConsumidos || productosSeleccionados.length === 0) return 0;
        return visitaMesaFinal.productosConsumidos
            .filter(p => productosSeleccionados.includes(p.id))
            .reduce((acc, p) => acc + (p.precio || p.precioDelMomento || 0), 0);
    }, [visitaMesaFinal, productosSeleccionados]);
    
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

    // Confirmar facturación desde el modal (todo o por partes). Recibe (arregloIds, idTipoPago, monto) de Modal_Facturar
    const handleConfirmarFacturacion = useCallback((arregloIds, idTipoPago, monto) => {
        PagarMesa(arregloIds, showSnackbarFacturacion, idTipoPago != null && monto != null ? { idTipoPago, monto } : undefined);
        setProductosSeleccionados([]);
        setShowModalFacturar(null);
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
                    sx={{ ...boxDividerLine, px: 2, flexShrink: 0 }}
                >
                    <Tab
                        label="Resumen"
                        icon={<RestaurantMenuIcon />}
                        iconPosition="start"
                    />
                    <Tab
                        label="Pagos registrados"
                        icon={<CheckCircleIcon />}
                        iconPosition="start"
                        disabled={!visitaMesaFinal}
                    />
                </Tabs>

                <Box sx={{ px: 3, pt: 2, pb: 1, flexShrink: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => setShowAgregarPedidos(true)}
                        size="small"
                        sx={{ py: 0.75, fontSize: '0.875rem', minWidth: 'auto' }}
                    >
                        Agregar Productos
                    </Button>
                    <Tooltip
                        title={productosAPagar.length > 0 ? "Facturá o cancelá los pedidos pendientes antes de cerrar la mesa" : ""}
                    >
                        <span style={{ display: 'inline-flex' }}>
                            <Modal_Generico
                                confirmar={true}
                                titulo="¿Seguro que desea cerrar la mesa?"
                                cuerpo="Todos los pedidos pendientes se marcarán como pagados"
                                textoBoton="Cerrar Mesa"
                                func={onCerrarMesa}
                                param={datos_mesa.id}
                                cerrar_modal={handleCloseWithCleanup}
                                disabled={productosAPagar.length > 0}
                                buttonSize="small"
                            />
                        </span>
                    </Tooltip>
                    <Modal_Generico
                        confirmar={true}
                        titulo="Cancelar pedidos"
                        cuerpo="¿Seguro que desea cancelar los pedidos?"
                        textoBoton={`Cancelar Pedidos${productosSeleccionados.length > 0 ? ` (${productosSeleccionados.length})` : ''}`}
                        func={handleCancelarPedidosConSnackbar}
                        param={productosSeleccionados}
                        cerrar_modal={handleCloseWithCleanup}
                        disabled={productosSeleccionados.length === 0}
                        buttonSize="small"
                    />
                </Box>

                <Box sx={{ 
                    p: 3, 
                    pt: 1,
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
                            estado={2}
                            titulo="Pagado"
                            subtitulo="Subtotal"
                        />
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 4, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => setShowModalFacturar('todo')}
                        disabled={!(productosAPagar.length > 0)}
                        startIcon={<ReceiptIcon />}
                        size="small"
                        sx={{ py: 0.75, fontSize: '0.875rem', minWidth: 'auto' }}
                    >
                        Facturar todo
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            if (productosSeleccionados.length === 0) {
                                showSnackbarFacturacion("Por favor, seleccione al menos un producto para facturar", "warning");
                                return;
                            }
                            setShowModalFacturar('partes');
                        }}
                        disabled={productosSeleccionados.length === 0}
                        startIcon={<PlaylistAddCheckIcon />}
                        size="small"
                        sx={{ py: 0.75, fontSize: '0.875rem', minWidth: 'auto' }}
                    >
                        Facturar por partes {productosSeleccionados.length > 0 && `(${productosSeleccionados.length})`}
                    </Button>
                </Box>
                <Button 
                    onClick={handleCloseWithCleanup} 
                    variant="outlined"
                    size="small"
                    sx={{ py: 0.75, fontSize: '0.875rem', minWidth: 'auto' }}
                >
                    Cerrar
                </Button>
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

            {/* Modal facturar (todo o por partes) */}
            {showModalFacturar === 'todo' && (
                <Modal_Facturar
                    open={true}
                    onClose={() => setShowModalFacturar(null)}
                    titulo="Facturar todo"
                    total={totalPedidos}
                    productIds={productosAPagar}
                    currencyFormatter={currencyFormatter}
                    onConfirm={handleConfirmarFacturacion}
                />
            )}
            {showModalFacturar === 'partes' && (
                <Modal_Facturar
                    open={true}
                    onClose={() => setShowModalFacturar(null)}
                    titulo="Facturar por partes"
                    total={totalPartes}
                    productIds={productosSeleccionados}
                    currencyFormatter={currencyFormatter}
                    onConfirm={handleConfirmarFacturacion}
                />
            )}
        </Dialog>
    );
};