import { React, useState } from "react"
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Box,
    Typography,
    Divider,
    Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import Errores from "./Errores"
import Handlers from "./Handlers";
import { Renderizados } from "./Renderizados";
import { 
    gradientButtonStyles, 
    cancelButtonStyles, 
    dialogTitleGradientStyles, 
    dialogActionsStyles 
} from "../../../styles/buttonStyles";

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
        campos: props.campos,
    });

    const renderizados = Renderizados(props, handleChange, errors);
    const nombreRegistro = props.nombre || 'registro';

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
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    }
                }}
            >
                <DialogTitle sx={dialogTitleGradientStyles}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <AddIcon />
                            </Box>
                            <Box>
                                <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                                    Agregar {nombreRegistro}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Complete los campos para crear un nuevo {nombreRegistro.toLowerCase()}
                                </Typography>
                            </Box>
                        </Stack>
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            size="small"
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <Errores errors={errors} />
                    <Box component="form" sx={{ mt: 1 }}>
                        <Stack spacing={3}>
                            {props.campos.map((campo, index) => {   
                                const renderer = renderizados[campo.type] || renderizados.text;
                                return renderer(campo, index);
                            })}
                        </Stack>
                    </Box>
                </DialogContent>
                <Divider />
                <DialogActions sx={dialogActionsStyles}>
                    <Button 
                        onClick={handleClose} 
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        sx={cancelButtonStyles}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        variant="contained" 
                        color="primary"
                        startIcon={<SaveIcon />}
                        sx={gradientButtonStyles}
                    >
                        Agregar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Modal_Agregar;

