import React, { useMemo } from 'react';
import {
    Alert,
    Box,
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
import { currencyFormatter, formatearFechaCompleta } from '../utils/constants';
import { usePaginacion } from '../../../components/Tabla/usePaginacion';
import TablaPaginacion from '../../../components/Tabla/TablaPaginacion';

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

    // Crear array con movimientos + fila de cierre (si existe) + fila de apertura
    const filaApertura = useMemo(() => ({
        id: 'apertura',
        fecha: fechaInicio,
        hora: horaInicio,
        tipo: 'apertura',
        descripcion: 'Caja abierta',
        monto: cajaActual.montoInicial ?? 0,
        saldo: cajaActual.montoInicial ?? 0,
        esEfectivo: true,
        esIngreso: true,
        esApertura: true
    }), [fechaInicio, horaInicio, cajaActual.montoInicial]);

    const todasLasFilas = useMemo(() => {
        return [...movimientos, filaApertura];
    }, [movimientos, filaApertura]);

    // Calcular diferencia para caja cerrada
    const diferenciaCaja = useMemo(() => {
        if (!esCajaCerrada || !cajaActual.montoFinal) {
            return null;
        }
        
        // Si ya viene calculada en la caja, usarla
        if (cajaActual.diferencia !== undefined && cajaActual.diferencia !== null) {
            return cajaActual.diferencia;
        }
        
        // Si no, calcularla: Monto Final - Monto Esperado
        // Monto Esperado = Monto Inicial + Suma de movimientos de efectivo
        let montoEsperado = cajaActual.montoInicial || 0;
        
        movimientos.forEach(mov => {
            if (mov.esEfectivo) {
                if (mov.esIngreso) {
                    montoEsperado += mov.monto;
                } else {
                    montoEsperado -= mov.monto;
                }
            }
        });
        
        return (cajaActual.montoFinal || 0) - montoEsperado;
    }, [esCajaCerrada, cajaActual, movimientos]);

    // Configurar paginación
    const rowsPerPage = 10;
    const {
        filasPaginadas,
        page,
        totalPages,
        handlePageChange,
        rowsPerPage: rowsPerPageValue
    } = usePaginacion(todasLasFilas, rowsPerPage, true);

    return (
        <Card variant="outlined">
            <CardHeader
                title={esCajaCerrada ? "Movimientos de caja cerrada" : "Movimientos de la caja activa"}
                subheader={
                    esCajaCerrada
                        ? `Caja cerrada: ${formatearFechaCompleta(fechaInicio, horaInicio)} - ${formatearFechaCompleta(fechaFin, horaFin)}`
                        : `Registro completo de transacciones desde ${formatearFechaCompleta(fechaInicio, horaInicio)}`
                }
                avatar={<ReceiptIcon color="action" />}
                action={
                    <Stack direction="row" spacing={1}>
                        {cajaSeleccionada && cajaActiva && onVolverACajaActiva && (
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
                ) : (
                    <>
                        {esCajaCerrada && fechaFin && cajaActual.montoFinal && (
                            <Alert 
                                severity="info" 
                                sx={{ mb: 2 }}
                            >
                                <Typography variant="body2">
                                    La caja se cerró con un Monto Real de <strong>{currencyFormatter.format(cajaActual.montoFinal)}</strong> el día <strong>{formatearFechaCompleta(fechaFin, horaFin)}</strong>
                                    {diferenciaCaja !== null && (
                                        <>
                                            {diferenciaCaja > 0 ? (
                                                <> con un sobrante de <strong>{currencyFormatter.format(diferenciaCaja)}</strong></>
                                            ) : diferenciaCaja < 0 ? (
                                                <> con un faltante de <strong>{currencyFormatter.format(Math.abs(diferenciaCaja))}</strong></>
                                            ) : (
                                                <> sin diferencia</>
                                            )}
                                        </>
                                    )}
                                </Typography>
                            </Alert>
                        )}
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
                                    {filasPaginadas.map((movimiento) => {
                                        const esApertura = movimiento.id === 'apertura' || movimiento.esApertura;
                                        return (
                                            <TableRow 
                                                key={movimiento.id} 
                                                hover={!esApertura}
                                                sx={esApertura ? { backgroundColor: 'action.hover' } : {}}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={esApertura ? 500 : 400}>
                                                        {formatearFechaCompleta(movimiento.fecha, movimiento.hora)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={
                                                            esApertura ? 'Apertura' : 
                                                            movimiento.tipo === 'venta' ? 'Venta' : 
                                                            movimiento.tipo
                                                        }
                                                        color={
                                                            esApertura ? 'primary' : 
                                                            movimiento.tipo === 'venta' ? 'success' : 
                                                            'default'
                                                        }
                                                        variant={esApertura ? 'filled' : 'outlined'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {esApertura ? (
                                                        <Typography variant="body2" fontWeight={500}>
                                                            Caja abierta
                                                        </Typography>
                                                    ) : (
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
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={600}
                                                        color={
                                                            movimiento.esEfectivo
                                                                ? movimiento.esIngreso || esApertura
                                                                    ? 'success.main'
                                                                    : 'error.main'
                                                                : 'text.secondary'
                                                        }
                                                    >
                                                        {movimiento.esIngreso || esApertura ? '+' : '-'}
                                                        {currencyFormatter.format(movimiento.monto ?? 0)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {currencyFormatter.format(movimiento.saldo ?? 0)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ mt: 2 }}>
                            <TablaPaginacion
                                habilitarPaginacion={true}
                                totalPages={totalPages}
                                page={page}
                                handlePageChange={handlePageChange}
                                rowsPerPage={rowsPerPageValue}
                                totalFilas={todasLasFilas.length}
                            />
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

