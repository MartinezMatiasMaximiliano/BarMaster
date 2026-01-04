import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaidIcon from '@mui/icons-material/Paid';
import { currencyFormatter } from '../utils/constants';

export const EstadoActual = ({ cajaActiva, balanceActual, onRecargar }) => {
    return (
        <Card variant="outlined">
            <CardHeader
                title="Estado de la caja"
                action={
                    <Tooltip title="Recargar">
                        <IconButton onClick={onRecargar} size="small">
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                }
                subheader={
                    cajaActiva
                        ? `Abierta desde ${cajaActiva.fechaApertura ?? cajaActiva.fecha} ${cajaActiva.horaApertura ?? ''}`
                        : 'No hay ninguna caja abierta actualmente.'
                }
            />
            <Divider />
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                        color={cajaActiva ? 'success' : 'error'}
                        label={cajaActiva ? 'Caja abierta' : 'Caja cerrada'}
                    />
                    {cajaActiva && (
                        <Chip
                            icon={<PaidIcon />}
                            color="primary"
                            variant="outlined"
                            label={`Monto inicial: ${currencyFormatter.format(
                                cajaActiva.montoInicial ?? 0
                            )}`}
                        />
                    )}
                </Stack>
                {cajaActiva && (
                    <Stack spacing={1} mt={2}>
                        <Typography variant="body2">
                            Responsable:{' '}
                            <strong>{cajaActiva.responsable ?? cajaActiva.usuario ?? 'Sin asignar'}</strong>
                        </Typography>
                        <Typography variant="body2">
                            Balance actual: <strong>{currencyFormatter.format(balanceActual ?? 0)}</strong>
                        </Typography>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

