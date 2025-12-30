import React from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { cancelButtonStyles } from '../../../styles/buttonStyles';

export const ConfirmLogoutDialog = ({ 
    open, 
    onClose, 
    onConfirm 
}) => {
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
                sx={{ fontWeight: 600, pb: 1 }}
            >
                Confirmar salida
            </DialogTitle>
            <DialogContent>
                <DialogContentText 
                    id="confirm-dialog-description"
                    sx={{ fontSize: '1rem', color: 'text.primary' }}
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
                    sx={cancelButtonStyles}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    startIcon={<LogoutIcon />}
                    sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                    Salir
                </Button>
            </DialogActions>
        </Dialog>
    );
};

