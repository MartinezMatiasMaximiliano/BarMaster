import React, { useState, useEffect } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_AgregarDelivery from "../components/Modals/Agregar_Delivery/Modal_AgregarDelivery";
import Modal_Detalles_Pedido from "../components/Modals/Modal_Detalles_Pedido";
import { formatearFecha } from "../Helpers/HelperFunctions"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import Checkbox from '@mui/material/Checkbox';
import { Button } from "@mui/material";
import {
    BorrarPersona,
    ModificarPersona
} from "../API/APIPersonas";
import { GetDeliveryTakeaway } from "../API/APIDeliveryTakeaway";
import { Campos, inicializarCampos } from "../configs/agregar/Delivery";

function Delivery(props) {
    const [campos, setCampos] = useState(Campos);

    // Inicializar campos solo cuando el componente se monte y haya token
    useEffect(() => {
        if (localStorage.getItem('token')) {
            inicializarCampos().then(camposInicializados => {
                setCampos(camposInicializados);
            });
        }
    }, []);

    const [deliveries, setDeliveries] = useState([]);
    const [showModalAgregar, setShowModalAgregar] = useState(false);

    // Cargar datos desde la API al montar y cuando se pide recargar
    const cargarDeliveries = React.useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        const data = await GetDeliveryTakeaway();
        const filas = (Array.isArray(data) ? data : []).map((item) => {
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
        setDeliveries(filas);
    }, []);

    useEffect(() => {
        cargarDeliveries();
    }, [cargarDeliveries]);

    const toggleEntregadoDelivery = (uuid) => {
        setDeliveries((prev) =>
            prev.map((delivery) =>
                delivery.uuid === uuid
                    ? { ...delivery, entregado: !delivery.entregado }
                    : delivery
            )
        );
    };

    const api = {
        eliminar: BorrarPersona,
        modificar: ModificarPersona,
    };

    const configSelect = {
        titulo: "Envío",
        name: "Envio",
        datos: [
            {
                "Id": 1,
                "nombre": "Corto",
                "precio": 500
            },
            {
                "Id": 2,
                "nombre": "Mediano",
                "precio": 750
            },
            {
                "Id": 3,
                "nombre": "Largo",
                "precio": 1000
            }
        ],
    }

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
                const tipo = fila.TipoEnvio;
                if (!tipo) return '-';
                const precio = tipo.precio ?? tipo.Precio;
                return precio != null ? '$' + precio : (tipo.nombre ?? tipo.Nombre ?? '-');
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
            align: "right",
            render: (fila) => (
                <Checkbox
                    checked={!!fila.entregado}
                    onChange={() => toggleEntregadoDelivery(fila.uuid)}
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
                    configSelect={configSelect}
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
        </Container>
    );
}

export default Delivery;

