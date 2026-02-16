import React from 'react';
import {
    Box,
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
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { currencyFormatter } from '../utils/constants';

export const EstadoActual = ({ cajaActiva, balanceActual, balanceNoEfectivo = 0, onRecargar }) => {
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
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
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
                    <Box
                        sx={{
                            mt: 2,
                            width: '100%',
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2
                        }}
                    >
                        <Box
                            sx={{
                                flex: '1 1 50%',
                                minWidth: 0,
                                p: 3,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                textAlign: 'center',
                                minHeight: 120,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                boxSizing: 'border-box'
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                                <PaidIcon sx={{ fontSize: 28 }} color="action" />
                                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                                    Balance en efectivo
                                </Typography>
                            </Stack>
                            <Typography variant="h4" component="div" fontWeight={700} sx={{ width: '100%' }}>
                                {currencyFormatter.format(balanceActual ?? 0)}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                flex: '1 1 50%',
                                minWidth: 0,
                                p: 3,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                textAlign: 'center',
                                minHeight: 120,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                boxSizing: 'border-box'
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                                <CreditCardIcon sx={{ fontSize: 28 }} color="action" />
                                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                                    Balance no efectivo
                                </Typography>
                            </Stack>
                            <Typography variant="h4" component="div" fontWeight={700} sx={{ width: '100%' }}>
                                {currencyFormatter.format(balanceNoEfectivo ?? 0)}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

