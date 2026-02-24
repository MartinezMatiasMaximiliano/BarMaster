import React, { useState, useEffect } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_AgregarDelivery from "../components/Modals/Agregar_Delivery/Modal_AgregarDelivery";
import Modal_Detalles_Pedido from "../components/Modals/Modal_Detalles_Pedido";
import { formatearFecha } from "../Helpers/HelperFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import Checkbox from '@mui/material/Checkbox';
import { Button } from "@mui/material";
import { BorrarPersona, ModificarPersona } from "../API/APIPersonas";
import { GetDeliveryTakeaway } from "../API/APIDeliveryTakeaway";
import { Campos, inicializarCampos } from "../configs/agregar/TakeAway";

function TakeAway(props) {
    const [campos, setCampos] = useState(Campos);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            inicializarCampos().then(camposInicializados => {
                setCampos(camposInicializados);
            });
        }
    }, []);

    const [takeAways, setTakeAways] = useState([]);
    const [showModalAgregar, setShowModalAgregar] = useState(false);

    const cargarTakeAways = React.useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        const data = await GetDeliveryTakeaway();
        const todos = Array.isArray(data) ? data : [];
        const soloTakeaway = todos.filter(
            (item) => (item.idTipoEnvio ?? item.IdTipoEnvio) == null
        );
        const filas = soloTakeaway.map((item) => {
            const productosRaw = item.productos ?? item.Productos ?? [];
            const productos = Array.isArray(productosRaw) ? productosRaw : [];
            return {
                uuid: item.id ?? item.Id,
                fechaHora: item.fechaHora ?? item.FechaHora ?? '',
                Cliente: item.nombreCliente ?? item.NombreCliente ?? '-',
                Direccion: item.direccion ?? item.Direccion ?? '-',
                Telefono: item.telefono ?? item.Telefono ?? '-',
                Indicaciones: item.indicaciones ?? item.Indicaciones ?? '-',
                TipoEnvio: item.tipoEnvio ?? item.TipoEnvio ?? null,
                PrecioTotal: item.precioTotal ?? item.PrecioTotal ?? 0,
                entregado: item.entregado ?? item.Entregado ?? false,
                Productos: productos.map((p) => ({
                    nombre: p.nombre ?? p.Nombre ?? '-',
                    precio: p.precio ?? p.Precio ?? 0,
                    indicaciones: p.indicaciones ?? p.Indicaciones ?? '',
                })),
            };
        });
        setTakeAways(filas);
    }, []);

    useEffect(() => {
        cargarTakeAways();
    }, [cargarTakeAways]);

    const toggleEntregadoTakeAway = (uuid) => {
        setTakeAways((prev) =>
            prev.map((takeAway) =>
                takeAway.uuid === uuid
                    ? { ...takeAway, entregado: !takeAway.entregado }
                    : takeAway
            )
        );
    };

    const api = {
        eliminar: BorrarPersona,
        modificar: ModificarPersona,
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
            align: "right",
            render: (fila) => (
                <Checkbox
                    checked={!!fila.entregado}
                    onChange={() => toggleEntregadoTakeAway(fila.uuid)}
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
                    recargar={props.recargarComponentes}
                    deleteLabel="Producto"
                    showToggle={() => false}
                    showEditar={true}
                    campos={campos}
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
