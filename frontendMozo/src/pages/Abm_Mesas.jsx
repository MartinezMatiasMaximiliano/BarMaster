import React from "react";
import { Container } from "react-bootstrap";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import {
    CrearMesa,
    ModificarMesa,
    BorrarMesa,
} from "../API/APIMesas";
import { Campos as Campos_Agregar } from "../configs/agregar/Mesas"
import { Campos as Campos_Editar} from "../configs/modificar/Mesas"

function Abm_Mesas(props) {
    const api = {
        crear: CrearMesa,
        modificar: ModificarMesa,
        eliminar: BorrarMesa,
    };

    const columnas = [
        { key: "numero", label: "Número de Mesa", align: "right" },
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
                    showEditar={fila.codigoParaPedir}
                    showToggle={() => false} // las mesas no se activan/desactivan
                    campos={Campos_Editar}
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
                onRefresh={props.recargarComponentes}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={["Número de Mesa", "Código", "Mozo"]}
                        agregar={api.crear}
                        campos={Campos_Agregar}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
            />
        </Container>
    );
}

export default Abm_Mesas;
