import { React, useState } from "react"
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

function Modal_Eliminar(props) {

    const endpoint = props.endpoint;
    const idFila = props.id;
    const userToken = localStorage.getItem('token');

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSave = async () => {
        await props.eliminar(idFila, userToken);

        // Cerrar el modal después de guardar
        handleClose();
        await props.recargarComponentes();
    };

    return (
        <>
            <IconButton
                color="error"
                onClick={handleShow}
                size="small"
            >
                <DeleteIcon fontSize="small" />
            </IconButton>

            <Dialog 
                open={show} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                disableEnforceFocus
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <span>Eliminar {props.mensaje}</span>
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
                    <Typography variant="body1">
                        ¿Está seguro que desea borrar el registro?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} variant="outlined">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="error">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Modal_Eliminar;
