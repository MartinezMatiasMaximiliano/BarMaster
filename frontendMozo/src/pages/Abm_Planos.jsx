import React, { useMemo } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Alert } from "@mui/material";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import {
    CrearPlano,
    ModificarPlano,
    BorrarPlano,
} from "../API/APIPlanos";
import { Campos as Campos_Agregar } from "../configs/agregar/Planos"
import { Campos as Campos_Editar } from "../configs/modificar/Planos"

function Abm_Planos(props) {

    const api = useMemo(() => ({
        crear: CrearPlano,
        modificar: ModificarPlano,
        eliminar: BorrarPlano,
    }), []);

    const columnas = useMemo(() => ([
        { key: "nombre", label: "Nombre", align: "right" },
        { key: "detalles", label: "Detalles", align: "right" },
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
                    showToggle={() => false} // los planos no se activan/desactivan
                    campos={Campos_Editar}
                />
            ),
        },
    ]), [api, props.recargarComponentes]);

    return (
        <Container>
            <Alert severity="info" sx={{ mb: 2 }}>
                Aquí puede administrar los planos (crear, editar, eliminar). Para ver la distribución de mesas por plano, vaya a{" "}
                <Link to="/distribucion_mesas">Operaciones → Distribución de las Mesas</Link>.
            </Alert>
            <Tabla
                titulo={props.titulo}
                filas={props.datos_planos}
                columnas={columnas}
                onRefresh={props.recargarComponentes}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={["Nombre", "Detalles"]}
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

export default Abm_Planos;

