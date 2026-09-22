import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

export default function ConfirmarHistoricoDialog({ open, onCancelar, onConfirmar }) {
    return (
        <Dialog
            open={open}
            onClose={onCancelar}
            aria-labelledby="confirmar-historico-title"
            aria-describedby="confirmar-historico-description"
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle id="confirmar-historico-title">
                Cargar registros históricos
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="confirmar-historico-description">
                    Cargar todos los registros históricos puede ralentizar la página. ¿Querés continuar?
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancelar} color="inherit">
                    Cancelar
                </Button>
                <Button onClick={onConfirmar} variant="contained" autoFocus>
                    Continuar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
