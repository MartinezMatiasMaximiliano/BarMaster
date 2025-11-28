import { useState, useMemo, useCallback, memo } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import connection from '../../connections/HubConnMozo';
import Lista_Items from '../Listas/Lista_Items';
import Modal_Generico from './Modal_Generico';
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { CambiarEstadoItems } from '../../API/APIItems';
import { GenerarTicketPDF } from '../../API/APIPedidos';
import { cambiarEstadoItems as CambiarEstadoItemsState } from '../../redux/slices/pedidosActivosSlice';
import { eliminar as eliminarTicket} from '../../redux/slices/ticketSlice';

// Componente memoizado para los chips del header
const ChipsHeader = memo(({ codigoParaPedir, cantidadItems, totalPedidos, currencyFormatter }) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ px: 3, pt: 2, pb: 1 }}>
        {codigoParaPedir && (
            <Chip
                label={`Código: ${codigoParaPedir}`}
                color="warning"
                variant="outlined"
            />
        )}
        <Chip label={`Items: ${cantidadItems}`} variant="outlined" />
        <Chip
            label={`Total: ${currencyFormatter.format(totalPedidos)}`}
            color="primary"
        />
    </Stack>
), (prevProps, nextProps) => {
    return prevProps.codigoParaPedir === nextProps.codigoParaPedir &&
           prevProps.cantidadItems === nextProps.cantidadItems &&
           prevProps.totalPedidos === nextProps.totalPedidos;
});

ChipsHeader.displayName = 'ChipsHeader';

// Componente memoizado para cada tab - solo se renderiza cuando es necesario
const TabContent = memo(({ pedidosMesa, estado, titulo, subtitulo, PagarMesa, facturar }) => {
    return (
        <Box
            sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 2,
                bgcolor: estado === false ? 'background.default' : 'transparent',
                minHeight: 200
            }}
        >
            <Lista_Items
                pedidosMesa={pedidosMesa}
                titulo={titulo}
                subtitulo={subtitulo}
                estado={estado}
                PagarMesa={PagarMesa}
                facturar={facturar}
            />
        </Box>
    );
}, (prevProps, nextProps) => {
    // Comparación optimizada para Firefox - más rápida
    if (prevProps.estado !== nextProps.estado ||
        prevProps.titulo !== nextProps.titulo ||
        prevProps.subtitulo !== nextProps.subtitulo ||
        prevProps.facturar !== nextProps.facturar ||
        prevProps.PagarMesa !== nextProps.PagarMesa) {
        return false;
    }
    
    // Comparación optimizada de pedidosMesa
    if (prevProps.pedidosMesa === nextProps.pedidosMesa) {
        return true;
    }
    
    const prevItems = prevProps.pedidosMesa?.[0]?.items;
    const nextItems = nextProps.pedidosMesa?.[0]?.items;
    
    if (!prevItems || !nextItems) {
        return prevItems === nextItems;
    }
    
    if (prevItems.length !== nextItems.length) {
        return false;
    }
    
    // Comparación más rápida: solo verificar primeros y últimos items
    // en lugar de crear strings completos (más eficiente en Firefox)
    if (prevItems.length > 0) {
        const firstPrev = prevItems[0];
        const firstNext = nextItems[0];
        const lastPrev = prevItems[prevItems.length - 1];
        const lastNext = nextItems[nextItems.length - 1];
        
        if (firstPrev.id !== firstNext.id || 
            firstPrev.estado !== firstNext.estado ||
            lastPrev.id !== lastNext.id || 
            lastPrev.estado !== lastNext.estado) {
            return false;
        }
    }
    
    return true;
});

TabContent.displayName = 'TabContent';

function Modal_Ver_cuenta(props) {
    const dispatch = useDispatch();

    // Selector optimizado con shallowEqual para evitar re-renders innecesarios
    const pedidosActivos = useSelector(
        (state) => state.pedidosActivos.value,
        shallowEqual
    );

    // Memoizar pedidosMesa para evitar recálculos innecesarios
    const pedidosMesa = useMemo(() => {
        if (!pedidosActivos || pedidosActivos.length === 0) return [];
        return pedidosActivos.filter(pedido => pedido.numeroMesa === props.datos_mesa.numeroMesa);
    }, [pedidosActivos, props.datos_mesa.numeroMesa]);

    const [show, setShow] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const handleClose = useCallback(() => {
        setShow(false);
        setTabValue(0);
    }, []);

    const handleShow = useCallback(() => {
        setShow(true);
    }, []);

    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);

    const PagarMesa = useCallback((arregloIds) => {
        // Actualizo la DB
        CambiarEstadoItems(arregloIds, "Pagar");

        // Genero la factura
        GenerarTicketPDF(props.datos_mesa.numeroMesa, arregloIds);

        // Se envia mensaje al cliente para actualizar su cuenta
        connection.send("RecargarTicket", props.datos_mesa.numeroMesa);

        // Actualizo el state pedidosActivos
        dispatch(CambiarEstadoItemsState({ idsItems: arregloIds, estadoNuevo: 2 }));

        // Actualizo el state ticket
        dispatch(eliminarTicket(arregloIds));

        alert("Pedidos facturados");

        handleClose();
        props.cerrar_modal_mesa();
    }, [props.datos_mesa.numeroMesa, props.cerrar_modal_mesa, dispatch, handleClose]);

    const itemsAPagar = useMemo(
        () => {
            if (!pedidosMesa[0]?.items) return [];
            return pedidosMesa[0].items
                .filter(item => item.estado !== 2)
                .map(item => item.id);
        },
        [pedidosMesa]
    );

    const totalPedidos = useMemo(() => {
        if (!pedidosMesa[0]?.items) return 0;
        return pedidosMesa[0].items.reduce((acc, item) => acc + (item.precio || 0), 0);
    }, [pedidosMesa]);

    const cantidadItems = useMemo(() => {
        return pedidosMesa[0]?.items?.length ?? 0;
    }, [pedidosMesa]);

    const currencyFormatter = useMemo(
        () =>
            new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 2
            }),
        []
    );

    return (
        <>
            <Button variant="primary" className="me-2" onClick={handleShow}>
                {props.textoBoton}
            </Button>

            <Dialog
                open={show}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ReceiptLongIcon color="primary" />
                            <Typography variant="h6">
                                {props.titulo} · Mesa {props.datos_mesa.numeroMesa}
                            </Typography>
                        </Stack>
                        <IconButton onClick={handleClose} size="small">
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
                            disabled={!pedidosMesa[0]}
                        />
                        <Tab
                            label="Pagos registrados"
                            icon={<CheckCircleIcon />}
                            iconPosition="start"
                            disabled={!pedidosMesa[0]}
                        />
                    </Tabs>

                    <Box sx={{ p: 3, minHeight: 300, maxHeight: 500, overflowY: 'auto' }}>
                        {tabValue === 0 && (
                            <TabContent
                                pedidosMesa={pedidosMesa}
                                estado={false}
                                titulo="Pedido total"
                                subtitulo="Total"
                            />
                        )}

                        {tabValue === 1 && (
                            <TabContent
                                pedidosMesa={pedidosMesa}
                                estado={1}
                                titulo="Ticket"
                                PagarMesa={PagarMesa}
                                facturar={true}
                            />
                        )}

                        {tabValue === 2 && (
                            <TabContent
                                pedidosMesa={pedidosMesa}
                                estado={2}
                                titulo="Pagado"
                                subtitulo="Subtotal"
                            />
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 4, py: 3 }}>
                    <Modal_Generico
                        textoBoton="Facturar todo"
                        titulo="Facturar todo"
                        cuerpo="¿Confirmar la acción?"
                        confirmar={true}
                        func={PagarMesa}
                        param={itemsAPagar}
                        disabled={!(itemsAPagar.length > 0)}
                        color="success"
                    />
                    <Button onClick={handleClose} variant="outlined">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default memo(Modal_Ver_cuenta);
