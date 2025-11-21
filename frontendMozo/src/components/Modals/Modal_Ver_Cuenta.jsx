import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    IconButton,
    Stack,
    Typography
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import connection from '../../connections/HubConnMozo';
import Lista_Items from '../Listas/Lista_Items';
import Modal_Generico from './Modal_Generico';
import { useSelector, useDispatch } from "react-redux";
import { CambiarEstadoItems } from '../../API/APIItems';
import { GenerarTicketPDF } from '../../API/APIPedidos';
import { cambiarEstadoItems as CambiarEstadoItemsState } from '../../redux/slices/pedidosActivosSlice';
import { eliminar as eliminarTicket} from '../../redux/slices/ticketSlice';


function Modal_Ver_cuenta(props) {

    const dispatch = useDispatch();

    const pedidosActivos = useSelector((state) => state.pedidosActivos.value);

    const [pedidosMesa, setPedidosMesa] = useState(
        pedidosActivos.filter(pedido => pedido.numeroMesa === props.datos_mesa.numeroMesa)
    );

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        setPedidosMesa(pedidosActivos.filter(pedido => pedido.numeroMesa === props.datos_mesa.numeroMesa));
    }, [pedidosActivos, props.datos_mesa.numeroMesa]);

    function PagarMesa(arregloIds) {

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

        // Cierro el modal

        alert("Pedidos facturados");

        handleClose();
        props.cerrar_modal_mesa();
    };

    const itemsAPagar = useMemo(
        () => pedidosMesa[0]?.items?.filter(item => item.estado !== 2).map(item => item.id) ?? [],
        [pedidosMesa]
    );

    const totalPedidos = useMemo(() => {
        const items = pedidosMesa[0]?.items ?? [];
        return items.reduce((acc, item) => acc + (item.precio || 0), 0);
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
                        <IconButton onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ px: 4 }}>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            {props.datos_mesa.codigoParaPedir && (
                                <Chip
                                    label={`Código: ${props.datos_mesa.codigoParaPedir}`}
                                    color="warning"
                                    variant="outlined"
                                />
                            )}
                            <Chip label={`Items: ${pedidosMesa[0]?.items?.length ?? 0}`} variant="outlined" />
                            <Chip
                                label={`Total: ${currencyFormatter.format(totalPedidos)}`}
                                color="primary"
                            />
                        </Stack>

                        <Box
                            sx={{
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                p: 2,
                                bgcolor: 'background.default'
                            }}
                        >
                            <Lista_Items
                                pedidosMesa={pedidosMesa}
                                titulo="Pedido total"
                                subtitulo="Total"
                                estado={false}
                            />
                        </Box>

                        <Divider flexItem textAlign="left">
                            <Typography variant="subtitle2" color="text.secondary">
                                Tickets abiertos
                            </Typography>
                        </Divider>

                        <Box
                            sx={{
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                p: 2,
                                maxHeight: { xs: 320, sm: 360 },
                                overflowY: 'auto'
                            }}
                        >
                            <Lista_Items
                                pedidosMesa={pedidosMesa}
                                titulo="Ticket"
                                PagarMesa={PagarMesa}
                                estado={1}
                                facturar={true}
                            />
                        </Box>

                        <Divider flexItem textAlign="left">
                            <Typography variant="subtitle2" color="text.secondary">
                                Pagos registrados
                            </Typography>
                        </Divider>

                        <Box
                            sx={{
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                p: 2
                            }}
                        >
                            <Lista_Items
                                pedidosMesa={pedidosMesa}
                                titulo="Pagado"
                                subtitulo="Subtotal"
                                estado={2}
                            />
                        </Box>
                    </Stack>
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
                    <Button onClick={handleClose}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Modal_Ver_cuenta;
