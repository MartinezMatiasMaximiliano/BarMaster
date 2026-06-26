import React, { useState, useEffect } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Alert, Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_AgregarDelivery from "../components/Modals/Agregar_Delivery/Modal_AgregarDelivery";
import Modal_Detalles_Pedido from "../components/Modals/Modal_Detalles_Pedido";
import { formatearFecha } from "../Helpers/HelperFunctions";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { Button, Checkbox } from "@mui/material";
import { useSelector } from 'react-redux';
import {
    CambiarEstadoEntregaDeliveryTakeaway,
    EliminarDeliveryTakeaway,
    GetDeliveryTakeaway,
    esTakeaway,
    normalizarDeliveryTakeaway,
} from "../API/APIDeliveryTakeaway";
import WarningIcon from '@mui/icons-material/Warning';

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

const mapearTakeAwayAFila = (item) => ({
    id: item.id,
    idVisita: item.idVisita,
    idDeliveryTakeaway: item.id,
    fechaHora: item.fechaHora,
    Cliente: item.cliente,
    Telefono: item.telefono || '-',
    Indicaciones: item.indicaciones || '-',
    PrecioTotal: item.precioTotal,
    entregado: item.entregado,
    entregadoTexto: item.entregado ? 'Sí' : 'No',
    pedido: {
        ...item,
        id: item.id,
    },
    Productos: item.productos.map((producto) => ({
        id: producto.id,
        idProducto: producto.idProducto,
        nombre: producto.nombre,
        precio: producto.precio,
        indicaciones: producto.indicaciones,
    })),
});

function TakeAway() {
    const hayCajaActiva = useSelector((state) => state.cajaActiva.value);
    const [takeAways, setTakeAways] = useState([]);
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);
    const [showModalAgregar, setShowModalAgregar] = useState(false);
    const [takeAwayEditando, setTakeAwayEditando] = useState(null);
    const [actualizandoEntregaIds, setActualizandoEntregaIds] = useState([]);
    const [errorCarga, setErrorCarga] = useState('');

    const cargarTakeAways = React.useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            setErrorCarga('');
            const data = await GetDeliveryTakeaway();
            const filas = (Array.isArray(data) ? data : [])
                .map(normalizarDeliveryTakeaway)
                .filter(esTakeaway)
                .map(mapearTakeAwayAFila);
            setTakeAways(filas);
        } catch (error) {
            console.error("Error al cargar take away:", error);
            setTakeAways([]);
            setErrorCarga('No se pudieron cargar los pedidos de take away con sus datos completos.');
        }
    }, []);

    useEffect(() => {
        cargarTakeAways();
    }, [cargarTakeAways]);

    useEffect(() => {
        setFilasFiltradas(takeAways);
        setFilasOrdenadas(takeAways);
    }, [takeAways]);

    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const manejarCambioEntregado = async (fila, checked) => {
        if (!fila?.id) return;
        if (!fila.idDeliveryTakeaway) return;

        setActualizandoEntregaIds((prev) => [...prev, fila.id]);
        try {
            await CambiarEstadoEntregaDeliveryTakeaway(fila.idDeliveryTakeaway, checked);
            setTakeAways((prev) =>
                prev.map((takeAway) =>
                    takeAway.id === fila.id
                        ? { ...takeAway, entregado: checked, entregadoTexto: checked ? 'Sí' : 'No' }
                        : takeAway
                )
            );
        } catch (error) {
            console.error("Error al actualizar estado de entrega:", error);
        } finally {
            setActualizandoEntregaIds((prev) => prev.filter((id) => id !== fila.id));
        }
    };

    const api = {
        eliminar: EliminarDeliveryTakeaway,
    };

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
            key: "entregado",
            label: "Entregado",
            align: "center",
            render: (fila) => (
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowModalAgregar(true)}
                        startIcon={<FontAwesomeIcon icon={faSquarePlus} />}
                        disabled={!hayCajaActiva}
                    >
                        Agregar
                    </Button>
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
                        filas={takeAways}
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
