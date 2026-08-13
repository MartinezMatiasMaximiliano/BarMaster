import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { handleConfirmarSalir } from '../../../Helpers/HelperFunctions';

/**
 * Componente de diálogo para confirmar la salida del sistema
 */
const ConfirmExitDialog = ({ 
    open, 
    onClose, 
    loginContext, 
    authTypeContext, 
    navigate 
}) => {
    const handleConfirm = () => {
        handleConfirmarSalir(loginContext, authTypeContext, onClose, navigate);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    minWidth: 400
                }
            }}
        >
            <DialogTitle 
                id="confirm-dialog-title"
                sx={{ 
                    fontWeight: 600,
                    pb: 1
                }}
            >
                Confirmar salida
            </DialogTitle>
            <DialogContent>
                <DialogContentText 
                    id="confirm-dialog-description"
                    sx={{ 
                        fontSize: '1rem',
                        color: 'text.primary'
                    }}
                >
                    ¿Estás seguro de que deseas salir del sistema? 
                    <br />
                    Serás redirigido a la página de inicio de sesión.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        color: 'grey.50',
                        '& .MuiSvgIcon-root': { color: 'grey.50' }
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="error"
                    startIcon={<LogoutIcon />}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3
                    }}
                >
                    Salir
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmExitDialog;

