import { React, useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
    Box,
    Typography,
    Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { Renderizados } from "./Renderizados";
import Errores from "./Errores"
import Handlers from "./Handlers";
import { 
    gradientButtonStyles, 
    cancelButtonStyles, 
    dialogTitleGradientStyles, 
    dialogActionsStyles 
} from "../../../styles/buttonStyles";

function Modal_Editar(props) {
    // Si se reciben show y onClose como props, usarlas (modo controlado)
    // Si no, usar estado interno (modo no controlado - retrocompatibilidad)
    const isControlled = props.show !== undefined && props.onClose !== undefined;
    const [showInterno, setShowInterno] = useState(false);
    
    const show = isControlled ? props.show : showInterno;
    const setShow = isControlled ? props.onClose : setShowInterno;

    const { id, activo } = props.fila;

    console.log('Modal_Editar props:', props);
    console.log('Modal_Editar campos:', props.campos);

    // Inicializar editValues con los valores de la fila
    const getInitialValues = () => {
        const { id, activo, estado, Estado, ...rest } = props.fila;
        return rest;
    };

    const [editValues, setEditValues] = useState(() => getInitialValues());

    const handleShow = () => {
        console.log('🔵 Abriendo modal de editar');
        console.log('🔵 Show actual:', show);
        console.log('🔵 Campos:', props.campos);
        console.log('🔵 Fila:', props.fila);
        if (!isControlled) {
            setShowInterno(true);
        }
        console.log('🔵 Show después de setShow:', true);
    };

    // Solo resetear valores cuando el modal se abre, no en cada render
    useEffect(() => {
        if (show) {
            const { id, activo, estado, Estado, ...filaFiltrada } = props.fila;
            setEditValues({ ...filaFiltrada });
        }
    }, [show]);

    const { errors, setErrors, handleChange, handleSave } = Handlers({
            id,
            editValues,
            setEditValues,
            modificar: props.modificar,
            recargarComponentes: props.recargarComponentes,
            handleClose: () => {
                if (isControlled) {
                    props.onClose();
                } else {
                    setShowInterno(false);
                }
            },
        });

    const handleClose = () => {
        setErrors({});
        if (isControlled) {
            props.onClose();
        } else {
            setShowInterno(false);
        }
    };

    const renderizados = Renderizados(props, handleChange);
    const nombreRegistro = props.nombre || 'registro';

    return (
        <>
            {!isControlled && (
                <IconButton
                    color="primary"
                    onClick={handleShow}
                    disabled={props.disabled}
                    size="small"
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            )}

            <Dialog 
                key={`dialog-${id}`}
                open={show} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                disableEnforceFocus
                disableRestoreFocus
                disableAutoFocus
                keepMounted={false}
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
                                <EditIcon />
                            </Box>
                            <Box>
                                <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                                    Editar {nombreRegistro}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Modifique los campos que desee actualizar
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
                                const value = editValues[campo.name];
                                const renderer = renderizados[campo.type] || renderizados.text;
                                return renderer(campo, value, index);
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
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Modal_Editar;