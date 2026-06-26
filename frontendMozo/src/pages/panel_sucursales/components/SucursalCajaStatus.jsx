import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { formatearFechaHora, formatearMoneda } from '../utils/formatters';

const SucursalCajaStatus = ({ caja = {} }) => {
    return (
        <Box
            sx={{
                flex: 1,
                p: 2,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <AccountBalanceWalletIcon color={caja.abierta ? 'success' : 'error'} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Estado de caja
                </Typography>
                <Chip
                    size="small"
                    color={caja.abierta ? 'success' : 'error'}
                    label={caja.abierta ? 'Abierta' : 'Cerrada'}
                />
            </Stack>

            {caja.abierta ? (
                <Stack spacing={0.75}>
                    <Typography variant="body2" color="text.secondary">
                        Apertura: {formatearFechaHora(caja.fechaApertura)}
                    </Typography>
                    <Typography variant="body2">Monto inicial: {formatearMoneda(caja.montoApertura)}</Typography>
                    <Typography variant="body2">Efectivo estimado: {formatearMoneda(caja.montoEfectivo)}</Typography>
                    <Typography variant="body2">No efectivo: {formatearMoneda(caja.montoNoEfectivo)}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Total caja: {formatearMoneda(caja.montoActual)}
                    </Typography>
                </Stack>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    No hay una caja abierta para esta sucursal.
                </Typography>
            )}
        </Box>
    );
};

export default SucursalCajaStatus;
