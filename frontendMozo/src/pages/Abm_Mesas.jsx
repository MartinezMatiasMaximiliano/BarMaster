import React from "react";
import { Container } from "react-bootstrap";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modal_Agregar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import {
    CrearMesa,
    ModificarMesa,
    BorrarMesa,
} from "../API/APIMesas";

function Abm_Mesas(props) {
    const api = {
        crear: CrearMesa,
        modificar: ModificarMesa,
        eliminar: BorrarMesa,
    };

    const configSelect = {
        titulo: "Mozo",
        name: "idMozo",
        datos: props.datos_select,
    }

    const columnas = [
        { key: "numeroMesa", label: "Número de Mesa", align: "right" },
        { key: "codigoParaPedir", label: "Código", align: "right" },
        { key: "nombreMozo", label: "Mozo", align: "right" },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Fila_Acciones
                    fila={fila}
                    api={api}
                    recargar={props.recargarComponentes}
                    deleteLabel="Mesa"
                    configSelect={configSelect}
                    showToggle={() => false} // las mesas no se activan/desactivan
                />
            ),
        },
    ];

    return (
        <Container>
            <Tabla
                titulo={props.titulo}
                filas={props.datos_mesas}
                columnas={columnas}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={["Número de Mesa", "Código", "Mozo"]}
                        titulo_select={props.titulo_select}
                        name_select={props.name_select}
                        datos_select={props.datos_select}
                        agregar={api.crear}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
            />
        </Container>
    );
}

export default Abm_Mesas;
