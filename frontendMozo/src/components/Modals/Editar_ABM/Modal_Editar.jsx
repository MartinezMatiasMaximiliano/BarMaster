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
import { LoadingButton } from "../../common/LoadingButton";
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

    // Inicializar editValues con los valores de la fila
    const getInitialValues = () => {
        const { id, activo, estado, Estado, ...rest } = props.fila;
        return rest;
    };

    const [editValues, setEditValues] = useState(() => getInitialValues());

    const handleShow = () => {
        if (!isControlled) {
            setShowInterno(true);
        }
    };

    // Solo resetear valores cuando el modal se abre, no en cada render
    useEffect(() => {
        if (show) {
            const { id, activo, estado, Estado, ...filaFiltrada } = props.fila;
            
            // Convertir nombres de categorías a IDs si es necesario
            if (filaFiltrada.categorias && Array.isArray(filaFiltrada.categorias) && filaFiltrada.categorias.length > 0) {
                const campoCategorias = props.campos?.find(campo => campo.name === 'categorias');
                const categoriasCompletas = campoCategorias?.options || [];
                
                // Verificar si son nombres (strings que no son GUIDs)
                const primerElemento = filaFiltrada.categorias[0];
                const esGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(primerElemento);
                
                if (!esGuid && categoriasCompletas.length > 0) {
                    // Convertir nombres a IDs
                    const mapaNombreAId = new Map(
                        categoriasCompletas.map(cat => [cat.nombre, cat.id])
                    );
                    filaFiltrada.categorias = filaFiltrada.categorias
                        .map(nombre => mapaNombreAId.get(nombre))
                        .filter(id => id !== undefined);
                }
            }
            
            setEditValues({ ...filaFiltrada });
        }
    }, [show, props.fila, props.campos]);

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
            campos: props.campos,
        });

    const handleClose = () => {
        setErrors({});
        if (isControlled) {
            props.onClose();
        } else {
            setShowInterno(false);
        }
    };

    const renderizados = Renderizados(props, handleChange, errors);
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
                    <LoadingButton 
                        onClick={handleSave} 
                        variant="contained" 
                        color="primary"
                        startIcon={<SaveIcon />}
                        sx={gradientButtonStyles}
                    >
                        Guardar Cambios
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Modal_Editar;
