import { memo, useState, useCallback } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
    Tab,
    Tabs,
    Typography,
    Box
} from '@mui/material';
import { SnackbarWrapper } from '../../common/SnackbarWrapper';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { useModalVerCuenta } from './hooks/useModalVerCuenta';
import ChipsHeader from './components/ChipsHeader';
import TabContent from './components/TabContent';
import Modal_Generico from '../Modal_Generico';

/**
 * Modal para ver y gestionar la cuenta de una mesa
 * Permite ver resumen, tickets abiertos y pagos registrados
 * También permite facturar todos los items pendientes
 */
function Modal_Ver_Cuenta(props) {
    const {
        show,
        tabValue,
        visitaMesa,
        productosAPagar,
        totalPedidos,
        cantidadItems,
        currencyFormatter,
        handleClose,
        handleShow,
        handleTabChange,
        PagarMesa
    } = useModalVerCuenta(props.datos_mesa, props.cerrar_modal_mesa);

    // Estado para productos seleccionados en el resumen
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);

    // Estado para Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    // Función para mostrar Snackbar
    const showSnackbar = useCallback((message, severity = 'info') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    }, []);

    // Cerrar Snackbar
    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
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
            showSnackbar("Por favor, seleccione al menos un producto para facturar", "warning");
            return;
        }
        PagarMesa(productosSeleccionados, showSnackbar);
        setProductosSeleccionados([]);
    }, [productosSeleccionados, PagarMesa, showSnackbar]);

    // Wrapper para PagarMesa que incluye showSnackbar
    const handlePagarMesa = useCallback((arregloIds) => {
        PagarMesa(arregloIds, showSnackbar);
    }, [PagarMesa, showSnackbar]);

    // Limpiar selección al cerrar el modal
    const handleCloseWithCleanup = useCallback(() => {
        setProductosSeleccionados([]);
        handleClose();
    }, [handleClose]);

    return (
        <>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleShow}
                startIcon={<ReceiptIcon />}
                size={props.buttonSize || 'medium'}
                sx={{ 
                    width: '100%',
                    py: props.buttonSize === 'small' ? 0.75 : 1.5,
                    fontSize: props.buttonSize === 'small' ? '0.875rem' : undefined
                }}
            >
                {props.textoBoton}
            </Button>

            <Dialog
                open={show}
                onClose={handleCloseWithCleanup}
                maxWidth="md"
                fullWidth
                disableEnforceFocus
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ReceiptLongIcon color="primary" />
                            <Typography variant="h6">
                                {props.titulo} · Mesa {props.datos_mesa.nombre}
                            </Typography>
                        </Stack>
                        <IconButton onClick={handleCloseWithCleanup} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0 }}>
                    <ChipsHeader
                        codigoParaPedir={props.datos_mesa.codigoParaPedir}
                        cantidadItems={cantidadItems}
                        totalPedidos={totalPedidos}
                        currencyFormatter={currencyFormatter}
                    />

                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                    >
                        <Tab
                            label="Resumen"
                            icon={<ShoppingCartIcon />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Tickets abiertos"
                            icon={<ReceiptIcon />}
                            iconPosition="start"
                            disabled={!visitaMesa}
                        />
                        <Tab
                            label="Pagos registrados"
                            icon={<CheckCircleIcon />}
                            iconPosition="start"
                            disabled={!visitaMesa}
                        />
                    </Tabs>

                    <Box sx={{ p: 3, minHeight: 300, maxHeight: 500, overflowY: 'auto' }}>
                        {tabValue === 0 && (
                            <TabContent
                                visitaMesa={visitaMesa}
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
                                visitaMesa={visitaMesa}
                                estado={1}
                                titulo="Ticket"
                                PagarMesa={handlePagarMesa}
                                facturar={true}
                            />
                        )}

                        {tabValue === 2 && (
                            <TabContent
                                visitaMesa={visitaMesa}
                                estado={2}
                                titulo="Pagado"
                                subtitulo="Subtotal"
                            />
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
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
                                width: 'auto'
                            }}
                        >
                            Facturar por partes {productosSeleccionados.length > 0 && `(${productosSeleccionados.length})`}
                        </Button>
                    </Stack>
                    <Button 
                        onClick={handleCloseWithCleanup} 
                        variant="outlined"
                        size="small"
                        sx={{
                            py: 0.75,
                            fontSize: '0.875rem'
                        }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            <SnackbarWrapper
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
        </>
    );
}

export default memo(Modal_Ver_Cuenta);

