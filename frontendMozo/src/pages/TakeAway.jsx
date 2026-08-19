import React, { useState, useEffect } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Alert, Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_AgregarDelivery from "../components/Modals/Agregar_Delivery/Modal_AgregarDelivery";
import Modal_Detalles_Pedido from "../components/Modals/Modal_Detalles_Pedido";
import BotonCobrarPedido from "../components/DeliveryTakeaway/BotonCobrarPedido";
import EntregaCountdown from "../components/DeliveryTakeaway/EntregaCountdown";
import { formatearFecha } from "../Helpers/HelperFunctions";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Checkbox, Divider, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import {
    CambiarEstadoEntregaDeliveryTakeaway,
    EliminarDeliveryTakeaway,
    GetDeliveryTakeaway,
    normalizarDeliveryTakeaway,
    normalizarDeliveryTakeawayComoVisita,
} from "../API/APIDeliveryTakeaway";
import { sincronizarVisitasDeliveryTakeaway, actualizarVisita } from "../redux/slices/visitasActivasSlice";
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';

const formatearProductosExportacion = (productos) => {
    if (!Array.isArray(productos) || productos.length === 0) {
        return '-';
    }

    return productos
        .map((producto) => {
            const nombre = producto?.nombre || 'Producto';
            const precio = producto?.precio != null ? `$${producto.precio}` : '';
            const indicaciones = producto?.indicaciones ? ` (${producto.indicaciones})` : '';

            return `${nombre}${precio ? ` ${precio}` : ''}${indicaciones}`;
        })
        .join(', ');
};

function TakeAway() {
    const dispatch = useDispatch();
    const hayCajaActiva = useSelector((state) => state.cajaActiva.value);
    const visitasActivas = useSelector((state) => state.visitasActivas.value);
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);
    const [showModalAgregar, setShowModalAgregar] = useState(false);
    const [takeAwayEditando, setTakeAwayEditando] = useState(null);
    const [actualizandoEntregaIds, setActualizandoEntregaIds] = useState([]);
    const [entregasEnTransicionIds, setEntregasEnTransicionIds] = useState([]);
    const [errorCarga, setErrorCarga] = useState('');
    const [mostrarEntregados, setMostrarEntregados] = useState(false);

    const takeAways = React.useMemo(() => (
        (Array.isArray(visitasActivas) ? visitasActivas : [])
            .filter((visita) => (visita.origen || '').toLowerCase() === 'takeaway')
            .map((visita) => {
                const item = visita.deliveryTakeaway || {};
                const productosConsumidos = Array.isArray(visita.productosConsumidos) ? visita.productosConsumidos : [];

                return {
                    id: item.id ?? visita.idDeliveryTakeaway,
                    idVisita: visita.id,
                    idDeliveryTakeaway: item.id ?? visita.idDeliveryTakeaway,
                    fechaHora: visita.fechaHora,
                    Cliente: item.cliente ?? '-',
                    Telefono: item.telefono || '-',
                    Indicaciones: item.indicaciones || '-',
                    PrecioTotal: item.precioTotal ?? productosConsumidos.reduce((acc, producto) => acc + (Number(producto.precio) || 0), 0),
                    pago: item.pago ?? null,
                    entregado: Boolean(item.entregado),
                    entregadoTexto: item.entregado ? 'Sí' : 'No',
                    estadoCobro: productosConsumidos.every((producto) => producto.estadoPagado) ? 'Cobrado' : 'Pendiente',
                    pedido: {
                        ...item,
                        id: item.id ?? visita.idDeliveryTakeaway,
                    },
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

    const takeAwaysPendientes = React.useMemo(
        () => takeAways.filter((takeAway) => (
            !takeAway.entregado || entregasEnTransicionIds.includes(takeAway.id)
        )),
        [takeAways, entregasEnTransicionIds]
    );
    const takeAwaysEntregados = React.useMemo(
        () => takeAways.filter((takeAway) => (
            takeAway.entregado && !entregasEnTransicionIds.includes(takeAway.id)
        )),
        [takeAways, entregasEnTransicionIds]
    );

    const cargarTakeAways = React.useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            setErrorCarga('');
            const data = await GetDeliveryTakeaway();
            const visitas = (Array.isArray(data) ? data : [])
                .map(normalizarDeliveryTakeaway)
                .map(normalizarDeliveryTakeawayComoVisita);
            dispatch(sincronizarVisitasDeliveryTakeaway(visitas));
        } catch (error) {
            console.error("Error al cargar take away:", error);
            setErrorCarga('No se pudieron cargar los pedidos de take away con sus datos completos.');
        }
    }, [dispatch]);

    useEffect(() => {
        cargarTakeAways();
    }, [cargarTakeAways]);

    useEffect(() => {
        setFilasFiltradas(takeAwaysPendientes);
        setFilasOrdenadas(takeAwaysPendientes);
    }, [takeAwaysPendientes]);

    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const despacharEstadoEntrega = (fila, checked) => {
        dispatch(actualizarVisita({
            id: fila.idVisita,
            idDeliveryTakeaway: fila.idDeliveryTakeaway,
            origen: 'Takeaway',
            fechaHora: fila.fechaHora,
            estado: 'Cerrada',
            deliveryTakeaway: {
                ...fila.pedido,
                id: fila.idDeliveryTakeaway,
                entregado: checked,
            },
            productosConsumidos: fila.Productos,
        }));
    };

    const manejarCambioEntregado = async (fila, checked) => {
        if (!fila?.id) return false;
        if (!fila.idDeliveryTakeaway) return false;

        setActualizandoEntregaIds((prev) => [...prev, fila.id]);
        try {
            await CambiarEstadoEntregaDeliveryTakeaway(fila.idDeliveryTakeaway, checked);
            setEntregasEnTransicionIds((prev) => checked
                ? (prev.includes(fila.id) ? prev : [...prev, fila.id])
                : prev.filter((id) => id !== fila.id));
            despacharEstadoEntrega(fila, checked);
            return true;
        } catch (error) {
            console.error("Error al actualizar estado de entrega:", error);
            return false;
        } finally {
            setActualizandoEntregaIds((prev) => prev.filter((id) => id !== fila.id));
        }
    };

    const cancelarEntregaEnTransicion = async (fila) => {
        setEntregasEnTransicionIds((prev) => prev.filter((id) => id !== fila.id));
        despacharEstadoEntrega(fila, false);

        const cancelado = await manejarCambioEntregado(fila, false);
        if (!cancelado) {
            despacharEstadoEntrega(fila, true);
        }
    };

    const api = {
        eliminar: EliminarDeliveryTakeaway,
    };

    const finalizarTransicionEntrega = React.useCallback((id) => {
        setEntregasEnTransicionIds((prev) => prev.filter((itemId) => itemId !== id));
    }, []);

    const columnasTakeAway = [
        {
            key: "fechaHora",
            label: "Fecha",
            render: (fila) => (fila.fechaHora ? formatearFecha(fila.fechaHora) : '-'),
        },
        { key: "Cliente", label: "Cliente" },
        { key: "Telefono", label: "Telefono" },
        { key: "Indicaciones", label: "Indicaciones" },
        {
            key: "PrecioTotal",
            label: "Total",
            render: (fila) => '$' + fila.PrecioTotal,
        },
        {
            key: "estadoCobro",
            label: "Cobro",
            align: "center",
            render: (fila) => (
                <BotonCobrarPedido
                    pedido={fila}
                    disabled={!hayCajaActiva}
                    onSuccess={cargarTakeAways}
                    titulo="Cobrar take away"
                />
            ),
        },
        {
            key: "entregado",
            label: "Entregado",
            align: "center",
            render: (fila) => entregasEnTransicionIds.includes(fila.id) ? (
                <EntregaCountdown
                    onComplete={() => finalizarTransicionEntrega(fila.id)}
                    onCancel={() => cancelarEntregaEnTransicion(fila)}
                />
            ) : (
                <Checkbox
                    checked={Boolean(fila.entregado)}
                    disabled={!fila.idDeliveryTakeaway || actualizandoEntregaIds.includes(fila.id)}
                    onChange={(event) => manejarCambioEntregado(fila, event.target.checked)}
                    inputProps={{ 'aria-label': 'Pedido entregado' }}
                />
            ),
        },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => fila.idDeliveryTakeaway ? (
                <Fila_Acciones
                    fila={fila}
                    api={api}
                    recargar={cargarTakeAways}
                    deleteLabel="pedido"
                    showToggle={() => false}
                    showEditar={true}
                    onClickEditar={() => setTakeAwayEditando(fila.pedido)}
                />
            ) : '-',
        },
        {
            key: "Productos",
            label: "Productos",
            render: (fila) => (
                <Modal_Detalles_Pedido
                    titulo="Detalles"
                    cuerpo={fila.Productos}
                    precioTotal={fila.PrecioTotal}
                />
            ),
        },
    ];

    const columnasTakeAwayEntregados = columnasTakeAway.filter((columna) => columna.key !== "__acciones");

    return (
        <Container>
            {!hayCajaActiva && (
                <Alert variant="warning" className="d-flex align-items-center shadow-sm mt-3 mb-3">
                    <WarningIcon className="me-2" style={{ fontSize: '1.5rem' }} />
                    <span>No se puede agregar takeaway si no hay una caja activa</span>
                </Alert>
            )}
            {errorCarga && (
                <Alert variant="danger" className="shadow-sm mt-3 mb-3">
                    {errorCarga}
                </Alert>
            )}
            <Tabla
                titulo="Take Away"
                filas={filasOrdenadas}
                columnas={columnasTakeAway}
                onRefresh={cargarTakeAways}
                exportacionConfig={{
                    columnas: [
                        {
                            key: 'fechaHora',
                            label: 'Fecha',
                            formatter: (_, fila) => (fila.fechaHora ? formatearFecha(fila.fechaHora) : '-'),
                        },
                        { key: 'Cliente', label: 'Cliente' },
                        { key: 'Telefono', label: 'Telefono' },
                        { key: 'Indicaciones', label: 'Indicaciones' },
                        {
                            key: 'PrecioTotal',
                            label: 'Total',
                            formatter: (_, fila) => `$${fila.PrecioTotal}`,
                        },
                        {
                            key: 'entregado',
                            label: 'Entregado',
                            formatter: (_, fila) => (fila.entregado ? 'Sí' : 'No'),
                        },
                        {
                            key: 'Productos',
                            label: 'Productos',
                            formatter: (_, fila) => formatearProductosExportacion(fila.Productos),
                        },
                    ],
                }}
                renderAgregar={() => (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setShowModalAgregar(true)}
                            startIcon={<AddIcon />}
                            disabled={!hayCajaActiva}
                        >
                            Agregar
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setMostrarEntregados(true)}
                        >
                            Ver entregados ({takeAwaysEntregados.length})
                        </Button>
                    </Stack>
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={[
                            { label: 'Fecha', campo: 'fechaHora', tipoOrden: 'fecha' },
                            { label: 'Cliente', campo: 'Cliente', tipoOrden: 'texto' },
                            { label: 'Teléfono', campo: 'Telefono', tipoOrden: 'numero' },
                            { label: 'Indicaciones', campo: 'Indicaciones', tipoOrden: 'texto' },
                            { label: 'Total', campo: 'PrecioTotal', tipoOrden: 'numero' },
                            { label: 'Entregado', campo: 'entregado', tipoOrden: 'booleano' },
                        ]}
                        onOrdenar={setFilasOrdenadas}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={takeAwaysPendientes}
                        columnas={[
                            { key: 'fechaHora', label: 'Fecha' },
                            { key: 'Cliente', label: 'Cliente' },
                            { key: 'Telefono', label: 'Teléfono' },
                            { key: 'Indicaciones', label: 'Indicaciones' },
                            { key: 'PrecioTotal', label: 'Total' },
                            { key: 'entregadoTexto', label: 'Entregado' },
                        ]}
                        configuracionFiltros={{
                            fechaHora: { tipo: 'text' },
                            Cliente: { tipo: 'text' },
                            Telefono: { tipo: 'number' },
                            Indicaciones: { tipo: 'text' },
                            PrecioTotal: { tipo: 'number' },
                            entregadoTexto: {
                                tipo: 'select',
                                opciones: [{ nombre: 'Sí' }, { nombre: 'No' }],
                            },
                        }}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
            />
            <Drawer
                anchor="right"
                open={mostrarEntregados}
                onClose={() => setMostrarEntregados(false)}
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
                        <Typography variant="h6">Take Away entregados</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {takeAwaysEntregados.length} pedido{takeAwaysEntregados.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setMostrarEntregados(false)} aria-label="Cerrar entregados">
                        <CloseIcon />
                    </IconButton>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Tabla
                    titulo="Take Away entregados"
                    filas={takeAwaysEntregados}
                    columnas={columnasTakeAwayEntregados}
                    onRefresh={cargarTakeAways}
                />
            </Drawer>
            <Modal_AgregarDelivery
                open={showModalAgregar}
                onClose={() => setShowModalAgregar(false)}
                onSuccess={cargarTakeAways}
                origen="Takeaway"
            />
            <Modal_AgregarDelivery
                open={Boolean(takeAwayEditando)}
                onClose={() => setTakeAwayEditando(null)}
                onSuccess={() => {
                    setTakeAwayEditando(null);
                    cargarTakeAways();
                }}
                origen="Takeaway"
                modo="editar"
                initialData={takeAwayEditando}
            />
        </Container>
    );
}

export default TakeAway;
