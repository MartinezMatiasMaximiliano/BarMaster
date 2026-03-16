import { React, useState } from "react"
import {
    Alert,
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
import { LoadingButton } from '../common/LoadingButton';

function Modal_Eliminar(props) {

    const idFila = props.id;

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [error, setError] = useState('');

    const handleSave = async () => {
        try {
            setError('');
            await props.eliminar(idFila);
            handleClose();
            await props.recargarComponentes();
        } catch (err) {
            setError(err.message || 'Ocurrió un error al eliminar. Intente nuevamente.');
        }
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
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} variant="outlined">
                        Cancelar
                    </Button>
                    <LoadingButton onClick={handleSave} variant="contained" color="error">
                        Eliminar
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Modal_Eliminar;
