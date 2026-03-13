import React, { useMemo, useState } from 'react';
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
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import PaidIcon from '@mui/icons-material/Paid';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import FilterListIcon from '@mui/icons-material/FilterList';
import { currencyFormatter, formatearFechaCompleta } from '../utils/constants';
import { usePaginacion } from '../../../components/Tabla/usePaginacion';
import TablaPaginacion from '../../../components/Tabla/TablaPaginacion';
import { useExportacionTabla } from '../../../hooks/useExportacionTabla';
import { BotonesExportacion } from '../../../components/Tabla/BotonesExportacion';

const FILTRO_TODOS = 'todos';
const FILTRO_EFECTIVO = 'efectivo';
const FILTRO_NO_EFECTIVO = 'noEfectivo';

export const Movimientos = ({
    cajaActiva,
    cajaSeleccionada,
    movimientos,
    loadingMovimientos,
    onRecargar,
    onVolverACajaActiva
}) => {
    const [filtroTipo, setFiltroTipo] = useState(FILTRO_TODOS);
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

    // Filtrar por efectivo / no efectivo
    const filasFiltradas = useMemo(() => {
        if (filtroTipo === FILTRO_TODOS) return todasLasFilas;
        if (filtroTipo === FILTRO_EFECTIVO) {
            return todasLasFilas.filter((f) => f.esEfectivo === true);
        }
        return todasLasFilas.filter((f) => f.esEfectivo === false);
    }, [todasLasFilas, filtroTipo]);

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

    // Configurar paginación (sobre filas filtradas)
    const rowsPerPage = 10;
    const {
        filasPaginadas,
        page,
        totalPages,
        handlePageChange,
        rowsPerPage: rowsPerPageValue
    } = usePaginacion(filasFiltradas, rowsPerPage, true);

    // Configurar exportación
    const columnasExportacion = [
        { key: 'fecha', label: 'Fecha/Hora', formatter: (val, fila) => formatearFechaCompleta(fila.fecha, fila.hora) },
        { 
            key: 'tipo', 
            label: 'Tipo', 
            formatter: (val, fila) => {
                const esApertura = fila.id === 'apertura' || fila.esApertura;
                return esApertura ? 'Apertura' : fila.tipo === 'venta' ? 'Venta' : fila.tipo || 'Movimiento';
            }
        },
        { 
            key: 'descripcion', 
            label: 'Descripción', 
            formatter: (val, fila) => {
                const esApertura = fila.id === 'apertura' || fila.esApertura;
                if (esApertura) return 'Caja abierta';
                let desc = fila.descripcion || '';
                if (fila.mesa) desc = `Mesa ${fila.mesa} - ${desc}`;
                return desc;
            }
        },
        { 
            key: 'monto', 
            label: 'Monto', 
            formatter: (val, fila) => {
                const esApertura = fila.id === 'apertura' || fila.esApertura;
                const signo = fila.esIngreso || esApertura ? '+' : '-';
                return `${signo}${currencyFormatter.format(fila.monto ?? 0)}`;
            }
        },
        { key: 'saldo', label: 'Saldo', formatter: (val) => currencyFormatter.format(val ?? 0) }
    ];

    const infoAdicional = [
        { label: 'Período', value: esCajaCerrada
            ? `${formatearFechaCompleta(fechaInicio, horaInicio)} - ${formatearFechaCompleta(fechaFin, horaFin)}`
            : `Desde ${formatearFechaCompleta(fechaInicio, horaInicio)}`
        },
        { label: 'Monto Inicial', value: currencyFormatter.format(cajaActual.montoInicial ?? 0) }
    ];

    if (esCajaCerrada && cajaActual.montoFinal !== null && cajaActual.montoFinal !== undefined) {
        infoAdicional.push({ label: 'Monto Final', value: currencyFormatter.format(cajaActual.montoFinal) });
        if (diferenciaCaja !== null && diferenciaCaja !== undefined) {
            if (diferenciaCaja > 0) {
                infoAdicional.push({ label: 'Sobrante', value: currencyFormatter.format(diferenciaCaja) });
            } else if (diferenciaCaja < 0) {
                infoAdicional.push({ label: 'Faltante', value: currencyFormatter.format(Math.abs(diferenciaCaja)) });
            } else {
                infoAdicional.push({ label: 'Diferencia', value: 'Sin diferencia' });
            }
        }
    }

    const { handleExportarPDF, handleExportarExcel } = useExportacionTabla({
        datos: filasFiltradas,
        columnas: columnasExportacion,
        titulo: 'Movimientos de Caja',
        subtitulo: esCajaCerrada ? 'Caja Cerrada' : 'Caja Activa',
        infoAdicional,
        nombreArchivo: esCajaCerrada
            ? `Movimientos_Caja_${fechaFin || fechaInicio}_${new Date().toISOString().split('T')[0]}`
            : `Movimientos_Caja_Activa_${new Date().toISOString().split('T')[0]}`
    });

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
                    <Stack direction="row" spacing={1} alignItems="center">
                        <BotonesExportacion
                            onExportarPDF={handleExportarPDF}
                            onExportarExcel={handleExportarExcel}
                            deshabilitado={loadingMovimientos || filasFiltradas.length === 0}
                        />
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
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                            <FilterListIcon color="action" fontSize="small" />
                            <ToggleButtonGroup
                                value={filtroTipo}
                                exclusive
                                onChange={(_, value) => value != null && setFiltroTipo(value)}
                                size="small"
                            >
                                <ToggleButton value={FILTRO_TODOS}>
                                    Todos
                                </ToggleButton>
                                <ToggleButton value={FILTRO_EFECTIVO}>
                                    <PaidIcon sx={{ mr: 0.5 }} fontSize="small" />
                                    Efectivo
                                </ToggleButton>
                                <ToggleButton value={FILTRO_NO_EFECTIVO}>
                                    <CreditCardIcon sx={{ mr: 0.5 }} fontSize="small" />
                                    No efectivo
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
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
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {(movimiento.descripcion || '').split(' | Vuelto: ')[0]}
                                                                </Typography>
                                                                {movimiento.descripcion?.includes(' | Vuelto: ') && (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Vuelto: {currencyFormatter.format(Number(movimiento.descripcion.split(' | Vuelto: ')[1]))}
                                                                    </Typography>
                                                                )}
                                                            </Box>
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
                                totalFilas={filasFiltradas.length}
                            />
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

