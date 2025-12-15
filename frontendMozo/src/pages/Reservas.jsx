import React, { useState } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { formatearFecha } from "../Helpers/HelperFunctions";
import { Campos } from "../configs/agregar/Reservas";
import { Chip } from "@mui/material";

function Reservas(props) {
    // Datos de prueba
    const [reservas, setReservas] = useState([
        {
            id: 1,
            FechaHora: "2025-01-15T20:00:00",
            NombreReserva: "Patricio Scidá",
            Telefono: "3511234567",
            CantidadDePersonas: 4,
            Mesa: 5,
            Estado: "Programado"
        },
        {
            id: 2,
            FechaHora: "2025-01-16T13:30:00",
            NombreReserva: "Juan Pérez",
            Telefono: "3512345678",
            CantidadDePersonas: 2,
            Mesa: 3,
            Estado: "Programado"
        },
        {
            id: 3,
            FechaHora: "2025-01-14T19:00:00",
            NombreReserva: "Marta García",
            Telefono: "3513456789",
            CantidadDePersonas: 8,
            Mesa: 10,
            Estado: "En Curso"
        },
        {
            id: 4,
            FechaHora: "2025-01-13T21:00:00",
            NombreReserva: "Marcelo González",
            Telefono: "3514567890",
            CantidadDePersonas: 6,
            Mesa: 7,
            Estado: "Finalizado"
        },
        {
            id: 5,
            FechaHora: "2025-01-17T14:00:00",
            NombreReserva: "Pedro López",
            Telefono: "3515678901",
            CantidadDePersonas: 3,
            Mesa: 2,
            Estado: "Programado"
        },
        {
            id: 6,
            FechaHora: "2025-01-15T12:00:00",
            NombreReserva: "María Fernández",
            Telefono: "3516789012",
            CantidadDePersonas: 5,
            Mesa: 4,
            Estado: "Finalizado"
        }
    ]);

    // Funciones API mock (se pueden reemplazar con llamadas reales)
    const crearReserva = async (datos) => {
        const nuevaReserva = {
            id: reservas.length + 1,
            ...datos,
            FechaHora: datos.FechaHora || new Date().toISOString()
        };
        setReservas([...reservas, nuevaReserva]);
    };

    const modificarReserva = async (datos) => {
        setReservas(reservas.map(r => r.id === datos.id ? { ...r, ...datos } : r));
    };

    const eliminarReserva = async (id) => {
        setReservas(reservas.filter(r => r.id !== id));
    };

    const api = {
        crear: crearReserva,
        modificar: modificarReserva,
        eliminar: eliminarReserva,
    };

    // Función para obtener el color del Chip según el estado
    const getEstadoColor = (estado) => {
        switch (estado) {
            case "Programado":
                return "warning";
            case "En Curso":
                return "info";
            case "Finalizado":
                return "success";
            default:
                return "default";
        }
    };

    const columnas = [
        {
            key: "FechaHora",
            label: "Fecha y Hora",
            render: (fila) => formatearFecha(fila.FechaHora)
        },
        { key: "NombreReserva", label: "Nombre de Reserva" },
        { key: "Telefono", label: "Teléfono" },
        { 
            key: "CantidadDePersonas", 
            label: "Cantidad de Personas",
            align: "right"
        },
        { 
            key: "Mesa", 
            label: "Mesa",
            align: "right"
        },
        { 
            key: "Estado", 
            label: "Estado",
            render: (fila) => (
                <Chip 
                    label={fila.Estado} 
                    color={getEstadoColor(fila.Estado)}
                    size="small"
                />
            )
        },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Fila_Acciones
                    fila={fila}
                    api={api}
                    recargar={props.recargarComponentes || (() => {})}
                    showEditar={true}
                    showToggle={() => false}
                    campos={Campos}
                />
            ),
        },
    ];

    return (
        <Container>
            <Tabla
                titulo="Reservas"
                filas={reservas}
                columnas={columnas}
                onRefresh={props.recargarComponentes || (() => {})}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes || (() => {})}
                        columnas={['Fecha y Hora', 'Nombre de Reserva', 'Teléfono', 'Cantidad de Personas', 'Mesa', 'Estado']}
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

export default Reservas;

