import React, { useState, useEffect } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_AgregarDelivery from "../components/Modals/Agregar_Delivery/Modal_AgregarDelivery";
import Modal_Detalles_Pedido from "../components/Modals/Modal_Detalles_Pedido";
import { formatearFecha } from "../Helpers/HelperFunctions"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { Button, Checkbox } from "@mui/material";
import { CambiarEstadoEntregaDeliveryTakeaway, EliminarDeliveryTakeaway, GetDeliveryTakeaway, esDelivery, normalizarDeliveryTakeaway } from "../API/APIDeliveryTakeaway";
import { BuscarTodosLosTipoEnvios } from "../API/APITipoEnvios";

function Delivery() {
    const [deliveries, setDeliveries] = useState([]);
    const [showModalAgregar, setShowModalAgregar] = useState(false);
    const [deliveryEditando, setDeliveryEditando] = useState(null);
    const [actualizandoEntregaIds, setActualizandoEntregaIds] = useState([]);

    // Cargar datos desde la API al montar y cuando se pide recargar
    const cargarDeliveries = React.useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const [data, tiposEnvio] = await Promise.all([
                GetDeliveryTakeaway(),
                BuscarTodosLosTipoEnvios().catch(() => []),
            ]);
            const mapaTiposEnvio = new Map((Array.isArray(tiposEnvio) ? tiposEnvio : []).map((tipo) => [Number(tipo.id), tipo]));
            const filas = (Array.isArray(data) ? data : [])
                .map(normalizarDeliveryTakeaway)
                .filter(esDelivery)
                .map((item) => {
                    const tipoEnvio = mapaTiposEnvio.get(Number(item.idTipoEnvio)) ?? item.tipoEnvio ?? null;
                    return {
                    id: item.id,
                    fechaHora: item.fechaHora,
                    Cliente: item.cliente,
                    Direccion: item.direccion || '-',
                    Telefono: item.telefono || '-',
                    Indicaciones: item.indicaciones || '-',
                    TipoEnvioId: item.idTipoEnvio,
                    TipoEnvio: tipoEnvio?.nombre || `Tipo ${item.idTipoEnvio}`,
                    PrecioEnvio: tipoEnvio?.precio ?? null,
                    PrecioTotal: item.precioTotal,
                    entregado: item.entregado,
                    pedido: item,
                    Productos: item.productos.map((producto) => ({
                        id: producto.id,
                        idProducto: producto.idProducto,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        indicaciones: producto.indicaciones,
                    })),
                    };
                });
            setDeliveries(filas);
        } catch (error) {
            console.error("Error al cargar deliveries:", error);
            setDeliveries([]);
        }
    }, []);

    useEffect(() => {
        cargarDeliveries();
    }, [cargarDeliveries]);

    const manejarCambioEntregado = async (fila, checked) => {
        if (!fila?.id) return;

        setActualizandoEntregaIds((prev) => [...prev, fila.id]);
        try {
            await CambiarEstadoEntregaDeliveryTakeaway(fila.id, checked);
            setDeliveries((prev) =>
                prev.map((delivery) =>
                    delivery.id === fila.id ? { ...delivery, entregado: checked } : delivery
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
                <Modal_Detalles_Pedido titulo="Detalles" cuerpo={fila.Productos} />
            )
        },
    ];

    return (
        <Container>
            <Tabla
                titulo="Delivery"
                filas={deliveries}
                columnas={columnasDelivery}
                onRefresh={cargarDeliveries}
                renderAgregar={() => (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowModalAgregar(true)}
                        startIcon={<FontAwesomeIcon icon={faSquarePlus} />}
                    >
                        Agregar
                    </Button>
                )}
            />
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

