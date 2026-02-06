import { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    IconButton,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Mapeo de variantes de react-bootstrap a Material UI
const variantMap = {
    'primary': 'contained',
    'success': 'contained',
    'secondary': 'outlined',
    'danger': 'contained',
    'warning': 'contained',
    'info': 'contained',
    'light': 'outlined',
    'dark': 'contained'
};

// Mapeo de colores para variantes
const colorMap = {
    'primary': 'primary',
    'success': 'success',
    'secondary': 'secondary',
    'danger': 'error',
    'warning': 'warning',
    'info': 'info',
    'light': 'default',
    'dark': 'default'
};

function Modal_Generico(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const confirmarModal = () => {
        if (props.titulo === "Cerrar mesa") {
            props.cerrar_modal();
        }
        setShow(false);
        props.param !== undefined ? props.func(props.param) : props.func();
    };

    const buttonVariant = props.variant ? props.variant : "primary";
    const muiVariant = variantMap[buttonVariant] || 'contained';
    const muiColor = props.color ? props.color : (colorMap[buttonVariant] || 'primary');


    // Determinar el ícono según el texto del botón
    const getButtonIcon = () => {
        const texto = props.textoBoton?.toLowerCase() || '';
        if (texto.includes('facturar')) return <ReceiptIcon />;
        if (texto.includes('cerrar')) return <LockIcon />;
        if (texto.includes('cancelar')) return <DeleteOutlineIcon />;
        return null;
    };

    return (
        <>
            <Button 
                variant={muiVariant}
                color={muiColor}
                onClick={handleShow} 
                disabled={props.disabled}
                startIcon={getButtonIcon()}
                size={props.buttonSize || 'medium'}
                sx={{ 
                    width: props.buttonSize === 'small' ? 'auto' : '100%',
                    py: props.buttonSize === 'small' ? 0.75 : 1.5,
                    fontSize: props.buttonSize === 'small' ? '0.875rem' : undefined
                }}
            >
                {props.textoBoton}
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
                        <Typography variant="h6" component="span">
                            {props.titulo}
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
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
                        {props.cuerpo}
                    </Typography>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={handleClose}
                        startIcon={<CancelIcon />}
                    >
                        Cancelar
                    </Button>
                    {props.confirmar && (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={confirmarModal}
                            startIcon={<CheckCircleIcon />}
                        >
                            Confirmar
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Modal_Generico;
