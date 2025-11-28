import { React, useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
    Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { Renderizados } from "./Renderizados";
import Errores from "./Errores"
import Handlers from "./Handlers";

function Modal_Editar(props) {
    const [show, setShow] = useState(false);

    const { id, activo, ...filaFiltrada } = props.fila;

    const [editValues, setEditValues] = useState({ ...filaFiltrada });

    const handleShow = () => setShow(true);

    useEffect(() => {
        if (show) setEditValues({ ...filaFiltrada });
    }, [show, filaFiltrada]);

    const { errors, setErrors, handleChange, handleSave } = Handlers({
            id,
            editValues,
            setEditValues,
            modificar: props.modificar,
            recargarComponentes: props.recargarComponentes,
            handleClose: () => setShow(false),
        });

    const handleClose = () => {
        setErrors({});
        setShow(false);
    };

    const renderizados = Renderizados(props, handleChange);

    console.log("EDITVALUES: ", editValues)

    return (
        <>
            <IconButton
                color="primary"
                onClick={handleShow}
                disabled={!props.disabled}
                size="small"
            >
                <EditIcon fontSize="small" />
            </IconButton>

            <Dialog 
                open={show} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <span>Editar</span>
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            size="small"
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <Errores errors={errors} />
                    <Box component="form" sx={{ mt: 1 }}>
                        <Stack spacing={2}>
                            {props.campos.map((campo, index) => {
                                const value = editValues[campo.name];
                                const renderer = renderizados[campo.type] || renderizados.text;
                                return renderer(campo, value, index);
                            })}
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} variant="outlined">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Editar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Modal_Editar;