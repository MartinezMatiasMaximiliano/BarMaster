import React, { useState, useEffect } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
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
import { Campos, inicializarCampos } from "../configs/agregar/TakeAway";

function TakeAway(props) {
    const [campos, setCampos] = useState(Campos);

    // Inicializar campos solo cuando el componente se monte y haya token
    useEffect(() => {
        if (localStorage.getItem('token')) {
            inicializarCampos().then(camposInicializados => {
                setCampos(camposInicializados);
            });
        }
    }, []);

    const [takeAways, setTakeAways] = useState([
        {
            "uuid": "b8f36e55-42c3-5e7b-c1f2-9e6b5c8d0f25",
            "IdCaja": 1,
            "Productos": [
                {
                    "id": 5,
                    "nombre": "Pizza Margarita",
                    "indicaciones": "Sin aceitunas",
                    "precio": 12000,
                },
                {
                    "id": 8,
                    "nombre": "Hamburguesa Clásica",
                    "indicaciones": "Sin cebolla",
                    "precio": 8500,
                },
            ],
            "IdPago": 1,
            "IdPersonaRegistro": 4,
            "fechaHora": "2025-10-24T15:30:00",
            "Cliente": "Carlos Rodríguez",
            "Telefono": "3515567890",
            "Indicaciones": "Retirar en 30 minutos",
            "PrecioProductos": 20500,
            "PrecioTotal": 20500
        },
        {
            "uuid": "c9g47f66-53d4-6f8c-d2g3-0f7c6d9e1g36",
            "IdCaja": 2,
            "Productos": [
                {
                    "id": 15,
                    "nombre": "Sushi Roll",
                    "indicaciones": "",
                    "precio": 18000,
                },
            ],
            "IdPago": 2,
            "IdPersonaRegistro": 7,
            "fechaHora": "2025-10-24T16:00:00",
            "Cliente": "Ana Martínez",
            "Telefono": "3516678901",
            "Indicaciones": "Retirar en mostrador",
            "PrecioProductos": 18000,
            "PrecioTotal": 18000
        }
    ]);

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
        crear: RegistrarPersona,
        eliminar: BorrarPersona,
        modificar: ModificarPersona,
    };

    const columnasTakeAway = [
        {
            key: "fechaHora",
            label: "Fecha",
            render: (fila) => (formatearFecha(fila.fechaHora))
        }, 
        { key: "Cliente", label: "Cliente" },
        { key: "Telefono", label: "Telefono" },
        { key: "Indicaciones", label: "Indicaciones" },
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
            )
        },
    ];

    return (
        <Container>
            <Tabla
                titulo="Take Away"
                filas={takeAways}
                columnas={columnasTakeAway}
                onRefresh={props.recargarComponentes}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={['Cliente', 'Telefono', 'Indicaciones', 'Productos']}
                        agregar={api.crear}
                        campos={campos}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
            />
        </Container>
    );
}

export default TakeAway;

