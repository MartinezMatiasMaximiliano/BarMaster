import { React, useState } from "react"
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Errores from "./Errores"
import Handlers from "./Handlers";
import { Renderizados } from "./Renderizados";

function Modal_Agregar(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setErrors({});
        setShow(false);
    };
    const handleShow = () => setShow(true);

    const { errors, setErrors, handleChange, handleSave } = Handlers({
        agregar: props.agregar,
        recargarComponentes: props.recargarComponentes,
        handleClose,
    });

    const renderizados = Renderizados(props, handleChange);

    return (
        <>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleShow}
                startIcon={<AddIcon />}
            >
                Agregar
            </Button>

            <Dialog 
                open={show} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                disableEnforceFocus
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <span>Agregar {props.nombre || 'registro'}</span>
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
                                const renderer = renderizados[campo.type] || renderizados.text;
                                return renderer(campo, index);
                            })}
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} variant="outlined">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Agregar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Modal_Agregar;
