import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Tabla from '../Tabla/Tabla';
import Ordenar from '../Ordenar/Ordenar';
import Filtros from '../Filtros/Filtros';
import { BuscarCuentaCorrientePorId } from '../../API/APICuentasCorrientes';
import { formatearFecha } from '../../Helpers/HelperFunctions';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
});

const mapearMovimiento = (movimiento) => ({
    id: movimiento.idMovimientoCaja ?? `${movimiento.fechaMovimiento}-${movimiento.descripcion}-${movimiento.monto}`,
    fechaMovimiento: movimiento.fechaMovimiento,
    tipo: movimiento.esIngreso ? 'Ingreso' : 'Egreso',
    medio: movimiento.esEfectivo ? 'Efectivo' : 'No efectivo',
    descripcion: movimiento.descripcion || '-',
    monto: Number(movimiento.monto ?? 0),
});

function MovimientosCuentaCorrienteDrawer({ open, cuentaCorriente, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cuentaCargada, setCuentaCargada] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);

    useEffect(() => {
        if (!open || !cuentaCorriente?.id) {
            return;
        }

        let ignorar = false;

        const cargarCuenta = async () => {
            setLoading(true);
            setError('');

            try {
                const cuenta = await BuscarCuentaCorrientePorId(cuentaCorriente.id);
                if (ignorar) return;

                const movimientosMapeados = (cuenta.movimientos ?? []).map(mapearMovimiento);

                setCuentaCargada(cuenta);
                setMovimientos(movimientosMapeados);
            } catch (err) {
                if (ignorar) return;
                setError(err?.message || 'No pudimos cargar los movimientos de la cuenta corriente.');
                setCuentaCargada(null);
                setMovimientos([]);
            } finally {
                if (!ignorar) {
                    setLoading(false);
                }
            }
        };

        cargarCuenta();

        return () => {
            ignorar = true;
        };
    }, [open, cuentaCorriente?.id]);

    useEffect(() => {
        setFilasFiltradas(movimientos);
        setFilasOrdenadas(movimientos);
    }, [movimientos]);

    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const columnas = useMemo(() => [
        {
            key: 'fechaMovimiento',
            label: 'Fecha',
            render: (fila) => (fila.fechaMovimiento ? formatearFecha(fila.fechaMovimiento) : '-'),
        },
        { key: 'tipo', label: 'Tipo' },
        { key: 'medio', label: 'Medio' },
        { key: 'descripcion', label: 'Descripción' },
        {
            key: 'monto',
            label: 'Monto',
            align: 'right',
            render: (fila) => currencyFormatter.format(fila.monto ?? 0),
            formatter: (_, fila) => currencyFormatter.format(fila.monto ?? 0),
        },
    ], []);

    const cuentaActual = cuentaCargada || cuentaCorriente;
    const titulo = cuentaActual?.nombre
        ? `Movimientos - ${cuentaActual.nombre}`
        : 'Movimientos de cuenta corriente';

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', md: 'min(50vw, 900px)' },
                    height: '100%',
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ px: 3, py: 2 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                        <Box>
                            <Typography variant="h6">
                                {titulo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Balance actual: {currencyFormatter.format(Number(cuentaActual?.balance ?? 0))}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Teléfono: {cuentaActual?.telefono || '-'}
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose} aria-label="Cerrar panel de movimientos">
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Box>
                <Divider />
                <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {loading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 320 }}>
                            <CircularProgress />
                        </Stack>
                    ) : (
                        <Tabla
                            titulo=""
                            filas={filasOrdenadas}
                            columnas={columnas}
                            rowsPerPage={12}
                            minHeightContenido="auto"
                            ajustarAlturaAlContenido={true}
                            exportacionConfig={{
                                titulo: `Movimientos cuenta corriente - ${cuentaActual?.nombre || ''}`.trim(),
                                columnas: [
                                    {
                                        key: 'fechaMovimiento',
                                        label: 'Fecha',
                                        formatter: (_, fila) => (fila.fechaMovimiento ? formatearFecha(fila.fechaMovimiento) : '-'),
                                    },
                                    { key: 'tipo', label: 'Tipo' },
                                    { key: 'medio', label: 'Medio' },
                                    { key: 'descripcion', label: 'Descripción' },
                                    {
                                        key: 'monto',
                                        label: 'Monto',
                                        formatter: (_, fila) => currencyFormatter.format(fila.monto ?? 0),
                                    },
                                ],
                            }}
                            renderOrdenar={() => (
                                <Ordenar
                                    filas={filasFiltradas}
                                    opcionesOrdenamiento={[
                                        { label: 'Fecha', campo: 'fechaMovimiento', tipoOrden: 'fecha' },
                                        { label: 'Tipo', campo: 'tipo', tipoOrden: 'texto' },
                                        { label: 'Medio', campo: 'medio', tipoOrden: 'texto' },
                                        { label: 'Descripción', campo: 'descripcion', tipoOrden: 'texto' },
                                        { label: 'Monto', campo: 'monto', tipoOrden: 'numero' },
                                    ]}
                                    onOrdenar={setFilasOrdenadas}
                                />
                            )}
                            renderFiltros={() => (
                                <Filtros
                                    filas={movimientos}
                                    columnas={columnas}
                                    configuracionFiltros={{
                                        fechaMovimiento: { tipo: 'text' },
                                        tipo: {
                                            tipo: 'select',
                                            opciones: [{ nombre: 'Ingreso' }, { nombre: 'Egreso' }],
                                        },
                                        medio: {
                                            tipo: 'select',
                                            opciones: [{ nombre: 'Efectivo' }, { nombre: 'No efectivo' }],
                                        },
                                        descripcion: { tipo: 'text' },
                                        monto: { tipo: 'number' },
                                    }}
                                    onFiltrar={setFilasFiltradas}
                                />
                            )}
                        />
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}

export default MovimientosCuentaCorrienteDrawer;
