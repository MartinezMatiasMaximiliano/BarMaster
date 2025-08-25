import React from "react";
import Modal_Eliminar from "../Modal_Eliminar";
import Modal_Editar from "../Modal_Editar";
import Switch from "../Switch";

export default function Fila_Acciones(props) {
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
                configSelect={props.configSelect}
                categoriasActivas={props.categoriasActivas}
                categoriasTotales={props.categoriasTotales}
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
