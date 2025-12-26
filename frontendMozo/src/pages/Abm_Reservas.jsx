import React from 'react'
import { Container } from 'react-bootstrap'
import { CrearReserva, ModificarReserva, BorrarReserva } from "../API/APIReservas";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { Campos } from "../configs/agregar/Reservas"
import { formatearFecha } from "../Helpers/HelperFunctions";
import { Chip } from "@mui/material";

// Diccionario de colores para cada IdEstado
const COLORES_ESTADO = {
    1: "warning",    // Pendiente
    2: "info",       // Confirmada
    3: "error",      // Cancelada
    4: "success"     // Completada
};

const getEstadoColor = (idEstado) => {
    return COLORES_ESTADO[idEstado] || "default";
};

function Abm_Reservas(props) {
    const api = {
        crear: CrearReserva,
        modificar: ModificarReserva,
        eliminar: BorrarReserva,
    };

    const columnas = [
        {
            key: "fechaHora",
            label: "Fecha y Hora",
            render: (fila) => formatearFecha(fila.fechaHora)
        },
        { key: "nombreReserva", label: "Nombre de Reserva" },
        { 
            key: "cantidadDePersonas", 
            label: "Cantidad de Personas",
            align: "right"
        },
        { 
            key: "estado", 
            label: "Estado",
            render: (fila) => (
                <Chip 
                    label={fila.estado} 
                    color={getEstadoColor(fila.IdEstadoReserva)}
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
                    recargar={props.recargarComponentes}
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
                titulo={props.titulo}
                filas={props.datos_reservas}
                columnas={columnas}
                onRefresh={props.recargarComponentes}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
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

export default Abm_Reservas;

