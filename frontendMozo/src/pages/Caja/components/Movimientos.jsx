import React from 'react';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import { currencyFormatter } from '../utils/constants';

export const Movimientos = ({
    cajaActiva,
    cajaSeleccionada,
    movimientos,
    loadingMovimientos,
    onRecargar,
    onVolverACajaActiva
}) => {
    const cajaActual = cajaSeleccionada || cajaActiva;
    
    if (!cajaActual) {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                        No hay una caja seleccionada para mostrar movimientos.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const esCajaCerrada = !!cajaSeleccionada && cajaSeleccionada.id !== cajaActiva?.id;
    const fechaInicio = cajaActual.fechaApertura ?? cajaActual.fecha;
    const horaInicio = cajaActual.horaApertura ?? '';
    const fechaFin = cajaActual.fechaCierre ?? '';
    const horaFin = cajaActual.horaCierre ?? '';

    return (
        <Card variant="outlined">
            <CardHeader
                title={esCajaCerrada ? "Movimientos de caja cerrada" : "Movimientos de la caja activa"}
                subheader={
                    esCajaCerrada
                        ? `Caja cerrada: ${fechaInicio} ${horaInicio} - ${fechaFin} ${horaFin}`
                        : `Registro completo de transacciones desde ${fechaInicio} ${horaInicio}`
                }
                avatar={<ReceiptIcon color="action" />}
                action={
                    <Stack direction="row" spacing={1}>
                        {cajaSeleccionada && cajaActiva && (
                            <Tooltip title="Ver caja activa">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={onVolverACajaActiva}
                                >
                                    Ver caja activa
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip title="Refrescar movimientos">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onRecargar}
                                    disabled={loadingMovimientos}
                                >
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                }
            />
            <Divider />
            <CardContent>
                {loadingMovimientos ? (
                    <Stack alignItems="center" py={4}>
                        <CircularProgress size={32} />
                    </Stack>
                ) : movimientos.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                        Aún no hay movimientos registrados.
                    </Typography>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Fecha/Hora</strong></TableCell>
                                    <TableCell><strong>Tipo</strong></TableCell>
                                    <TableCell><strong>Descripción</strong></TableCell>
                                    <TableCell align="right"><strong>Monto</strong></TableCell>
                                    <TableCell align="right"><strong>Saldo</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {movimientos.map((movimiento) => (
                                    <TableRow key={movimiento.id} hover>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {movimiento.fecha}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {movimiento.hora}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={movimiento.tipo === 'apertura' ? 'Apertura' : movimiento.tipo === 'venta' ? 'Venta' : movimiento.tipo}
                                                color={movimiento.tipo === 'apertura' ? 'primary' : movimiento.tipo === 'venta' ? 'success' : 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {movimiento.mesa && (
                                                    <Chip
                                                        size="small"
                                                        icon={<LocalDiningIcon />}
                                                        label={`Mesa ${movimiento.mesa}`}
                                                        variant="outlined"
                                                    />
                                                )}
                                                {!movimiento.mesa && movimiento.tipo === 'venta' && (
                                                    <Chip
                                                        size="small"
                                                        icon={<DeliveryDiningIcon />}
                                                        label={movimiento.descripcion.includes('Delivery') ? 'Delivery' : 'Take Away'}
                                                        variant="outlined"
                                                    />
                                                )}
                                                <Typography variant="body2">
                                                    {movimiento.descripcion}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                color={movimiento.tipo === 'apertura' ? 'primary.main' : 'success.main'}
                                            >
                                                {movimiento.tipo === 'apertura' ? '+' : '+'}
                                                {currencyFormatter.format(movimiento.monto ?? 0)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={500}>
                                                {currencyFormatter.format(movimiento.saldo ?? 0)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>
    );
};

