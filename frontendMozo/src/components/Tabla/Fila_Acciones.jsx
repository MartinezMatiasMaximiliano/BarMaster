import React from "react";
import { Stack, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
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

            {props.showEditar && props.onClickEditar && (
                <IconButton
                    color="primary"
                    onClick={props.onClickEditar}
                    size="small"
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            )}

            {props.showEditar && !props.onClickEditar && (
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
