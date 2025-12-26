import React from "react";
import { Stack } from "@mui/material";
import Modal_Eliminar from "../Modals/Modal_Eliminar";
import Modal_Editar from "../Modals/Editar_ABM/Modal_Editar";
import Switch from "../Switch";

export default function Fila_Acciones(props) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            {props.showToggle() && (
                <Switch
                    activo={props.fila.activo}
                    id={props.fila.id}
                    activar={props.api.activar}
                    desactivar={props.api.desactivar}
                />
            )}

            {props.showEditar && (
                <Modal_Editar
                    recargarComponentes={props.recargar}
                    fila={props.fila}
                    modificar={props.api.modificar}
                    campos={props.campos}
                    disabled={false}
                />
            )}

            <Modal_Eliminar
                recargarComponentes={props.recargar}
                mensaje={props.deleteLabel}
                nombre={props.fila.nombre}
                id={props.fila.id}
                eliminar={props.api.eliminar}
            />
        </Stack>
    );
}
