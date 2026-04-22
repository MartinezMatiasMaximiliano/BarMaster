import React from "react";
import Tabla from "../components/Tabla/Tabla";
import { Container } from "react-bootstrap";
import Modal_Cambiar_Codigo_Mozo from "../components/Modals/Modal_Cambiar_Codigo_Mozo";

function Abm_Mozos(props) {
    const mozosActivos = (props.datos_mozos || []).filter((mozo) => mozo.activo === true);

    const columnas = [
        { key: "codigoDeServicio", label: "Código" },
        { key: "nombre", label: "Nombre" },
        { key: "apellido", label: "Apellido" },
        { key: "dni", label: "DNI" },
        { key: "direccion", label: "Dirección" },
        { key: "telefono", label: "Teléfono" },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Modal_Cambiar_Codigo_Mozo datos={fila} recargarComponentes={props.recargarComponentes} />
            ),
        },
    ];

    return (
        <Container>
            <Tabla
                onRefresh={props.recargarComponentes}
                titulo={props.titulo}
                columnas={columnas}
                filas={mozosActivos}
            />
        </Container>
    );
}

export default Abm_Mozos;
