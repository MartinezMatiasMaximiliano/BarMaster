import React from "react";
import Modal_Eliminar from "../Modals/Modal_Eliminar";
import Modal_Editar from "../Modals/Editar/Modal_Editar";
import Switch from "../Switch";
import { Campos } from "../../configs/agregar/Categorias"

export default function Fila_Acciones(props) {
    console.log("FILA EN FILA ACCIONES: ", props.fila)
    return (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            {props.showToggle() && (
                <Switch
                    activo={props.fila.activo}
                    id={props.fila.id}
                    activar={props.api.activar}
                    desactivar={props.api.desactivar}
                />
            )}

            <Modal_Editar
                recargarComponentes={props.recargar}
                fila={props.fila}
                modificar={props.api.modificar}
                campos={props.campos}
                disabled={props.showEditar}
            />

            <Modal_Eliminar
                recargarComponentes={props.recargar}
                mensaje={props.deleteLabel}
                nombre={props.fila.nombre}
                id={props.fila.id}
                eliminar={props.api.eliminar}
            />
        </div>
    );
}
