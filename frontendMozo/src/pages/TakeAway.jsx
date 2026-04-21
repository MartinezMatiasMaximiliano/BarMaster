import React, { useState, useEffect } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Alert, Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_AgregarDelivery from "../components/Modals/Agregar_Delivery/Modal_AgregarDelivery";
import Modal_Detalles_Pedido from "../components/Modals/Modal_Detalles_Pedido";
import { formatearFecha } from "../Helpers/HelperFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { Button, Checkbox } from "@mui/material";
import { useSelector } from 'react-redux';
import { CambiarEstadoEntregaDeliveryTakeaway, EliminarDeliveryTakeaway, esTakeaway, GetDeliveryTakeaway, normalizarDeliveryTakeaway } from "../API/APIDeliveryTakeaway";
import WarningIcon from '@mui/icons-material/Warning';

function TakeAway() {
    const hayCajaActiva = useSelector((state) => state.cajaActiva.value);
    const [takeAways, setTakeAways] = useState([]);
    const [showModalAgregar, setShowModalAgregar] = useState(false);
    const [actualizandoEntregaIds, setActualizandoEntregaIds] = useState([]);

    const cargarTakeAways = React.useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const data = await GetDeliveryTakeaway();
            const filas = (Array.isArray(data) ? data : [])
                .map(normalizarDeliveryTakeaway)
                .filter(esTakeaway)
                .map((item) => ({
                    id: item.id,
                    fechaHora: item.fechaHora,
                    Cliente: item.cliente,
                    Telefono: item.telefono || '-',
                    Indicaciones: item.indicaciones || '-',
                    PrecioTotal: item.precioTotal,
                    entregado: item.entregado,
                    Productos: item.productos.map((producto) => ({
                        nombre: producto.nombre,
                        precio: producto.precio,
                        indicaciones: producto.indicaciones,
                    })),
                }));
            setTakeAways(filas);
        } catch (error) {
            console.error("Error al cargar take away:", error);
            setTakeAways([]);
        }
    }, []);

    useEffect(() => {
        cargarTakeAways();
    }, [cargarTakeAways]);

    const manejarCambioEntregado = async (fila, checked) => {
        if (!fila?.id) return;

        setActualizandoEntregaIds((prev) => [...prev, fila.id]);
        try {
            await CambiarEstadoEntregaDeliveryTakeaway(fila.id, checked);
            setTakeAways((prev) =>
                prev.map((takeAway) =>
                    takeAway.id === fila.id ? { ...takeAway, entregado: checked } : takeAway
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
                    disabled={actualizandoEntregaIds.includes(fila.id)}
                    onChange={(event) => manejarCambioEntregado(fila, event.target.checked)}
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
                    recargar={cargarTakeAways}
                    deleteLabel="pedido"
                    showToggle={() => false}
                    showEditar={false}
                />
            ),
        },
        {
            key: "Productos",
            label: "Productos",
            render: (fila) => (
                <Modal_Detalles_Pedido titulo="Detalles" cuerpo={fila.Productos} />
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
            <Tabla
                titulo="Take Away"
                filas={takeAways}
                columnas={columnasTakeAway}
                onRefresh={cargarTakeAways}
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
            />
            <Modal_AgregarDelivery
                open={showModalAgregar}
                onClose={() => setShowModalAgregar(false)}
                onSuccess={cargarTakeAways}
                origen="Takeaway"
            />
        </Container>
    );
}

export default TakeAway;
