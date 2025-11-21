import React, { useState } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar/Index";
import Modal_Detalles_Pedido from "../components/Modals/Modal_Detalles_Pedido";
import { formatearFecha } from "../Helpers/HelperFunctions"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import Checkbox from '@mui/material/Checkbox';
import {
    RegistrarPersona,
    BorrarPersona,
    ModificarPersona
} from "../API/APIPersonas";
import { Campos } from "../configs/agregar/Delivery_Takeaway";

function Delivery_TakeAway(props) {
    const [deliveries, setDeliveries] = useState([
        {
            "uuid": "a7e25e44-31b2-4d6a-b0e1-8d5a4b7fce14",
            "IdCaja": 2,
            "Productos": [
                {
                    "id": 10,
                    "nombre": "Milanesa Napolitana",
                    "indicaciones": "Con puré en lugar de ensalada",
                    "precio": 12500,
                },
                {
                    "id": 13,
                    "nombre": "Paella",
                    "indicaciones": "",
                    "precio": 16500,
                },
                {
                    "id": 22,
                    "nombre": "Paella",
                    "indicaciones": "",
                    "precio": 16500,
                },
            ],
            "IdPago": 1,
            "IdPersonaRegistro": 5,
            "TipoEnvio": {
                "Id": 2,
                "nombre": "Mediano",
                "precio": 750,
            },
            "IdPersonaCadete": 8,
            "fechaHora": "2025-10-24T13:45:00",
            "Cliente": "Juan Pérez",
            "Direccion": "Av. Siempre Viva 742",
            "Indicaciones": "Tocar timbre A, dejar en portón si no atienden",
            "Telefono": "3516789012",
            "PrecioProductos": 45500,
            "PrecioTotal": 46250
        },
        {
            "uuid": "f83a0b1d-52af-4891-b7f9-5e2a184c1a90",
            "IdCaja": 3,
            "Productos": [
                {
                    "id": 6,
                    "nombre": "Paella",
                    "indicaciones": "",
                    "precio": 16500,
                },
                {
                    "id": 1,
                    "nombre": "Bondiola Desmenuzada",
                    "indicaciones": "",
                    "precio": 13000,
                },
            ],
            "IdPago": 2,
            "IdPersonaRegistro": 6,
            "TipoEnvio": {
                "Id": 1,
                "nombre": "Corto",
                "precio": 500,
            },
            "IdPersonaCadete": null,
            "fechaHora": "2025-10-24T14:10:00",
            "Cliente": "María Gómez",
            "Direccion": "Calle Los Álamos 123",
            "Indicaciones": "Casa con rejas verdes",
            "Telefono": "3514456789",
            "PrecioProductos": 950,
            "PrecioTotal": 1250
        }
    ]);

    const toggleEntregado = (uuid) => {
        setDeliveries((prev) =>
            prev.map((delivery) =>
                delivery.uuid === uuid
                    ? { ...delivery, entregado: !delivery.entregado }
                    : delivery
            )
        );
    };

    const api = {
        crear: RegistrarPersona,
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

    const columnas = [
        {
            key: "fechaHora",
            label: "Fecha",
            render: (fila) => (formatearFecha(fila.fechaHora))
        }, 
        { key: "Cliente", label: "Cliente" },
        { key: "Direccion", label: "Direccion" },
        { key: "Telefono", label: "Telefono" },
        { key: "Indicaciones", label: "Indicaciones" },
        {
            key: "TipoEnvio",
            label: "Envío",
            render: (fila) => (
                '$' + fila.TipoEnvio.precio
            )
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
                    onChange={() => toggleEntregado(fila.uuid)}
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
                    campos={Campos}
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
        <h2>Delivery</h2>
            <Tabla
                titulo={props.titulo}
                filas={deliveries}
                columnas={columnas}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={['Cliente', 'Dirección', 'Telefono', 'Indicaciones', 'Envio', 'Productos']}
                        configSelect={configSelect}
                        agregar={api.crear}
                        campos={Campos}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
            />
        </Container>
    );
}

export default Delivery_TakeAway;