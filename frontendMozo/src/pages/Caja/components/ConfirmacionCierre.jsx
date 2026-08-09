import React from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Typography
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { currencyFormatter } from '../utils/constants';

const FilaMonto = ({ etiqueta, monto, destacado = false, color = 'text.primary' }) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography color="text.secondary">{etiqueta}</Typography>
        <Typography color={color} fontWeight={destacado ? 700 : 600} variant={destacado ? 'h6' : 'body1'}>
            {currencyFormatter.format(monto)}
        </Typography>
    </Stack>
);

export const ConfirmacionCierre = ({ datos, guardando, onCancelar, onConfirmar }) => {
    const diferencia = datos?.diferencia ?? 0;
    const colorDiferencia = diferencia === 0 ? 'text.primary' : diferencia > 0 ? 'success.main' : 'error.main';

    return (
        <Dialog
            open={Boolean(datos)}
            onClose={guardando ? undefined : onCancelar}
            fullWidth
            maxWidth="xs"
            aria-labelledby="confirmar-cierre-title"
        >
            <DialogTitle id="confirmar-cierre-title">Confirmar cierre de caja</DialogTitle>
            <DialogContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Confirmá que el monto ingresado es el dinero presente físicamente en la caja.
                </Alert>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
                    <Stack spacing={1.5}>
                        <FilaMonto etiqueta="Monto contado" monto={datos?.montoFinal ?? 0} destacado />
                        <FilaMonto etiqueta="Monto según el sistema" monto={datos?.montoSistema ?? 0} />
                        <Divider />
                        <FilaMonto
                            etiqueta="Diferencia real"
                            monto={diferencia}
                            destacado
                            color={colorDiferencia}
                        />
                    </Stack>
                </Box>
                <Typography sx={{ mt: 2 }}>
                    ¿El monto contado es correcto y querés cerrar la caja?
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onCancelar} disabled={guardando} variant="outlined">
                    Revisar monto
                </Button>
                <Button
                    onClick={onConfirmar}
                    disabled={guardando}
                    variant="contained"
                    color="success"
                    startIcon={guardando ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                >
                    {guardando ? 'Cerrando...' : 'Sí, cerrar caja'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
