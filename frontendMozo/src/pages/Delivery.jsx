import React, { useState, useEffect } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Alert, Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_AgregarDelivery from "../components/Modals/Agregar_Delivery/Modal_AgregarDelivery";
import Modal_Detalles_Pedido from "../components/Modals/Modal_Detalles_Pedido";
import BotonCobrarPedido from "../components/DeliveryTakeaway/BotonCobrarPedido";
import { formatearFecha } from "../Helpers/HelperFunctions"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import {
    CambiarEstadoEntregaDeliveryTakeaway,
    EliminarDeliveryTakeaway,
    GetDeliveryTakeaway,
    normalizarDeliveryTakeaway,
    normalizarDeliveryTakeawayComoVisita,
} from "../API/APIDeliveryTakeaway";
import { BuscarTodosLosTipoEnvios } from "../API/APITipoEnvios";
import { sincronizarVisitasDeliveryTakeaway, actualizarVisita } from "../redux/slices/visitasActivasSlice";
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';

function Delivery() {
    const dispatch = useDispatch();
    const hayCajaActiva = useSelector((state) => state.cajaActiva.value);
    const visitasActivas = useSelector((state) => state.visitasActivas.value);
    const [showModalAgregar, setShowModalAgregar] = useState(false);
    const [deliveryEditando, setDeliveryEditando] = useState(null);
    const [actualizandoEntregaIds, setActualizandoEntregaIds] = useState([]);
    const [confirmarNoEntregado, setConfirmarNoEntregado] = useState(null);
    const [mostrarEnviados, setMostrarEnviados] = useState(false);

    const deliveries = React.useMemo(() => (
        (Array.isArray(visitasActivas) ? visitasActivas : [])
            .filter((visita) => (visita.origen || '').toLowerCase() === 'delivery')
            .map((visita) => {
                const item = visita.deliveryTakeaway || {};
                const productosConsumidos = Array.isArray(visita.productosConsumidos) ? visita.productosConsumidos : [];
                const tipoEnvio = item.tipoEnvio ?? null;

                return {
                    id: item.id ?? visita.idDeliveryTakeaway,
                    idVisita: visita.id,
                    fechaHora: visita.fechaHora,
                    Cliente: item.cliente ?? '-',
                    Direccion: item.direccion || '-',
                    Telefono: item.telefono || '-',
                    Indicaciones: item.indicaciones || '-',
                    Cadete: item.cadete
                        ? `${item.cadete.nombre} ${item.cadete.apellido}`.trim() || '-'
                        : '-',
                    TipoEnvioId: item.idTipoEnvio,
                    TipoEnvio: tipoEnvio?.nombre || (item.idTipoEnvio ? `Tipo ${item.idTipoEnvio}` : '-'),
                    PrecioEnvio: tipoEnvio?.precio ?? null,
                    PrecioTotal: item.precioTotal ?? productosConsumidos.reduce((acc, producto) => acc + (Number(producto.precio) || 0), 0),
                    entregado: Boolean(item.entregado),
                    estadoCobro: productosConsumidos.every((producto) => producto.estadoPagado) ? 'Cobrado' : 'Pendiente',
                    pedido: item,
                    Productos: productosConsumidos.map((producto) => ({
                        id: producto.id,
                        idProducto: producto.idProducto,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        indicaciones: producto.indicaciones,
                        estadoPagado: producto.estadoPagado,
                    })),
                };
            })
    ), [visitasActivas]);

    // Cargar datos desde la API al montar y cuando se pide recargar
    const cargarDeliveries = React.useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const [data, tiposEnvio] = await Promise.all([
                GetDeliveryTakeaway(),
                BuscarTodosLosTipoEnvios().catch(() => []),
            ]);
            const mapaTiposEnvio = new Map((Array.isArray(tiposEnvio) ? tiposEnvio : []).map((tipo) => [Number(tipo.id), tipo]));
            const visitas = (Array.isArray(data) ? data : [])
                .map(normalizarDeliveryTakeaway)
                .map((item) => {
                    const tipoEnvio = mapaTiposEnvio.get(Number(item.idTipoEnvio)) ?? item.tipoEnvio ?? null;
                    return normalizarDeliveryTakeawayComoVisita({
                        ...item,
                        tipoEnvio,
                    });
                });
            dispatch(sincronizarVisitasDeliveryTakeaway(visitas));
        } catch (error) {
            console.error("Error al cargar deliveries:", error);
        }
    }, [dispatch]);

    useEffect(() => {
        cargarDeliveries();
    }, [cargarDeliveries]);

    const manejarCambioEntregado = async (fila, checked) => {
        if (!fila?.id) return;

        setActualizandoEntregaIds((prev) => [...prev, fila.id]);
        try {
            await CambiarEstadoEntregaDeliveryTakeaway(fila.id, checked);
            dispatch(actualizarVisita({
                id: fila.idVisita,
                idDeliveryTakeaway: fila.id,
                origen: 'Delivery',
                fechaHora: fila.fechaHora,
                estado: 'Cerrada',
                deliveryTakeaway: {
                    ...fila.pedido,
                    id: fila.id,
                    entregado: checked,
                },
                productosConsumidos: fila.Productos,
            }));
        } catch (error) {
            console.error("Error al actualizar estado de entrega:", error);
        } finally {
            setActualizandoEntregaIds((prev) => prev.filter((id) => id !== fila.id));
        }
    };

    const solicitarCambioEntregado = (fila, checked) => {
        if (fila.entregado && !checked) {
            setConfirmarNoEntregado(fila);
            return;
        }

        manejarCambioEntregado(fila, checked);
    };

    const confirmarCambioANoEntregado = async () => {
        const fila = confirmarNoEntregado;
        setConfirmarNoEntregado(null);
        await manejarCambioEntregado(fila, false);
    };

    const api = {
        eliminar: EliminarDeliveryTakeaway,
    };

    const deliveriesPendientes = deliveries.filter((delivery) => !delivery.entregado);
    const deliveriesEntregados = deliveries.filter((delivery) => delivery.entregado);

    const columnasDelivery = [
        {
            key: "fechaHora",
            label: "Fecha",
            render: (fila) => (fila.fechaHora ? formatearFecha(fila.fechaHora) : '-')
        }, 
        { key: "Cliente", label: "Cliente" },
        { key: "Direccion", label: "Direccion" },
        { key: "Telefono", label: "Telefono" },
        { key: "Indicaciones", label: "Indicaciones" },
        { key: "Cadete", label: "Cadete" },
        {
            key: "TipoEnvio",
            label: "Envío",
            render: (fila) => {
                if (!fila.TipoEnvio) return '-';
                return fila.PrecioEnvio != null
                    ? `${fila.TipoEnvio} ($${fila.PrecioEnvio})`
                    : fila.TipoEnvio;
            }
        },
        {
            key: "PrecioTotal",
            label: "Total",
            render: (fila) => ('$' + fila.PrecioTotal)
        }, 
        {
            key: "estadoCobro",
            label: "Cobro",
            align: "center",
            render: (fila) => (
                <BotonCobrarPedido
                    pedido={fila}
                    disabled={!hayCajaActiva}
                    onSuccess={cargarDeliveries}
                    titulo="Cobrar delivery"
                />
            ),
        },
        {
            key: "entregado",
            label: "Entregado",
            align: "center",
            render: (fila) => (
                <Checkbox
                    checked={Boolean(fila.entregado)}
                    disabled={actualizandoEntregaIds.includes(fila.id)}
                    onChange={(event) => solicitarCambioEntregado(fila, event.target.checked)}
                    inputProps={{ 'aria-label': 'Pedido entregado' }}
                />
            ),
        }, 
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Fila_Acciones
                    fila={fila}
                    api={api}
                    recargar={cargarDeliveries}
                    deleteLabel="pedido"
                    showToggle={() => false}
                    showEditar={true}
                    onClickEditar={() => setDeliveryEditando(fila.pedido)}
                />
            ),
        },
        {
            key: "Productos",
            label: "Productos",
            render: (fila) => (
                <Modal_Detalles_Pedido
                    titulo="Detalles"
                    cuerpo={fila.Productos}
                    precioEnvio={fila.PrecioEnvio}
                    precioTotal={fila.PrecioTotal}
                />
            )
        },
    ];

    const columnasDeliveryEntregados = columnasDelivery.filter((columna) => columna.key !== "__acciones");

    return (
        <Container>
            {!hayCajaActiva && (
                <Alert variant="warning" className="d-flex align-items-center shadow-sm mt-3 mb-3">
                    <WarningIcon className="me-2" style={{ fontSize: '1.5rem' }} />
                    <span>No se puede agregar delivery si no hay una caja activa</span>
                </Alert>
            )}
            <Tabla
                titulo="Delivery"
                filas={deliveriesPendientes}
                columnas={columnasDelivery}
                onRefresh={cargarDeliveries}
                renderAgregar={() => (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setShowModalAgregar(true)}
                            startIcon={<FontAwesomeIcon icon={faSquarePlus} />}
                            disabled={!hayCajaActiva}
                        >
                            Agregar
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setMostrarEnviados(true)}
                        >
                            Ver enviados ({deliveriesEntregados.length})
                        </Button>
                    </Stack>
                )}
            />
            <Drawer
                anchor="right"
                open={mostrarEnviados}
                onClose={() => setMostrarEnviados(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', md: '82vw' },
                        maxWidth: 1200,
                        p: 2,
                    },
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Box>
                        <Typography variant="h6">Delivery enviados</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {deliveriesEntregados.length} pedido{deliveriesEntregados.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setMostrarEnviados(false)} aria-label="Cerrar enviados">
                        <CloseIcon />
                    </IconButton>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Tabla
                    titulo="Delivery enviados"
                    filas={deliveriesEntregados}
                    columnas={columnasDeliveryEntregados}
                    onRefresh={cargarDeliveries}
                />
            </Drawer>
            <Dialog
                open={Boolean(confirmarNoEntregado)}
                onClose={() => setConfirmarNoEntregado(null)}
            >
                <DialogTitle>Marcar como no entregado</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Querés cambiar este delivery a no entregado?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmarNoEntregado(null)} variant="outlined">
                        Cancelar
                    </Button>
                    <Button onClick={confirmarCambioANoEntregado} variant="contained" color="primary">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
            <Modal_AgregarDelivery
                open={showModalAgregar}
                onClose={() => setShowModalAgregar(false)}
                onSuccess={cargarDeliveries}
            />
            <Modal_AgregarDelivery
                open={Boolean(deliveryEditando)}
                onClose={() => setDeliveryEditando(null)}
                onSuccess={() => {
                    setDeliveryEditando(null);
                    cargarDeliveries();
                }}
                modo="editar"
                initialData={deliveryEditando}
            />
        </Container>
    );
}

export default Delivery;

