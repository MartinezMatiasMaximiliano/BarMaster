import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Typography
} from '@mui/material';
import SouthOutlinedIcon from '@mui/icons-material/SouthOutlined';
import { ObtenerHistorialCaja } from '../../API/APICaja';
import Tabla from '../../components/Tabla/Tabla';
import BuscadorTabla from '../../components/Tabla/BuscadorTabla';
import { Movimientos } from '../Caja/components/Movimientos';
import { useCajaHistorial } from '../Caja/hooks/useCajaHistorial';
import { currencyFormatter, formatearFechaCompleta, obtenerMensajeError } from '../Caja/utils/constants';
import { estaFechaEnRango, filtrarPorBusqueda, tieneFiltroHistorialActivo } from './utils';

export default function HistorialTabCajas({ fechaInicio, fechaFin, modoHistorico }) {
    const [historialCompleto, setHistorialCompleto] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [error, setError] = useState('');
    const [datosCargados, setDatosCargados] = useState(false);
    const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
    const [textoBusqueda, setTextoBusqueda] = useState('');

    const {
        movimientos,
        loadingMovimientos,
        cargarMovimientos
    } = useCajaHistorial();

    const filtroActivo = tieneFiltroHistorialActivo({ fechaInicio, fechaFin, modoHistorico });

    const cargarHistorial = async () => {
        setLoadingHistorial(true);
        setError('');

        try {
            const data = await ObtenerHistorialCaja({ limite: 1000 });
            setHistorialCompleto(Array.isArray(data) ? data : []);
            setDatosCargados(true);
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos cargar el historial.'));
            setHistorialCompleto([]);
            setDatosCargados(false);
        } finally {
            setLoadingHistorial(false);
        }
    };

    React.useEffect(() => {
        let ignorar = false;

        if (!filtroActivo) {
            setHistorialCompleto([]);
            setDatosCargados(false);
            setError('');
            setLoadingHistorial(false);
            setCajaSeleccionada(null);
            return undefined;
        }

        const cargar = async () => {
            setLoadingHistorial(true);
            setError('');

            try {
                const data = await ObtenerHistorialCaja({ limite: 1000 });
                if (ignorar) return;
                setHistorialCompleto(Array.isArray(data) ? data : []);
                setDatosCargados(true);
            } catch (err) {
                if (ignorar) return;
                setError(obtenerMensajeError(err, 'No pudimos cargar el historial.'));
                setHistorialCompleto([]);
                setDatosCargados(false);
            } finally {
                if (!ignorar) {
                    setLoadingHistorial(false);
                }
            }
        };

        setCajaSeleccionada(null);
        cargar();

        return () => {
            ignorar = true;
        };
    }, [filtroActivo, fechaInicio, fechaFin, modoHistorico]);

    const arqueosFiltrados = useMemo(() => {
        if (!filtroActivo) {
            return [];
        }

        const filtradosPorFecha = historialCompleto.filter((caja) => {
            if (modoHistorico) {
                return true;
            }

            const fechaArqueo = caja.fechaCierre ?? caja.fechaApertura;
            return estaFechaEnRango(fechaArqueo, fechaInicio, fechaFin);
        });

        return filtrarPorBusqueda(
            filtradosPorFecha,
            textoBusqueda,
            ['id', 'fechaApertura', 'horaApertura', 'fechaCierre', 'horaCierre', 'montoInicial', 'montoFinal', 'diferencia']
        );
    }, [historialCompleto, filtroActivo, modoHistorico, fechaInicio, fechaFin, textoBusqueda]);

    const handleSeleccionArqueo = (arqueo) => {
        if (cajaSeleccionada?.id === arqueo.id) {
            setCajaSeleccionada(null);
            return;
        }

        setCajaSeleccionada(arqueo);
        cargarMovimientos(arqueo.id, arqueo.montoInicial);
    };

    const columnas = useMemo(() => ([
        {
            key: 'fechaApertura',
            label: 'Apertura',
            align: 'left',
            render: (fila) => formatearFechaCompleta(fila.fechaApertura, fila.horaApertura),
        },
        {
            key: 'fechaCierre',
            label: 'Cierre',
            align: 'left',
            render: (fila) => (
                fila.fechaCierre
                    ? formatearFechaCompleta(fila.fechaCierre, fila.horaCierre)
                    : '-'
            ),
        },
        {
            key: 'montoInicial',
            label: 'Monto Apertura',
            align: 'right',
            render: (fila) => currencyFormatter.format(fila.montoInicial ?? 0),
        },
        {
            key: 'montoFinal',
            label: 'Monto Cierre',
            align: 'right',
            render: (fila) => (
                fila.montoFinal != null
                    ? currencyFormatter.format(fila.montoFinal)
                    : '-'
            ),
        },
        {
            key: 'diferencia',
            label: 'Diferencia',
            align: 'center',
            render: (fila) => {
                const diferencia = Number(fila.diferencia ?? 0);
                const label = diferencia > 0
                    ? `Sobrante: ${currencyFormatter.format(diferencia)}`
                    : diferencia < 0
                    ? `Faltante: ${currencyFormatter.format(Math.abs(diferencia))}`
                    : 'Sin diferencia';

                return (
                    <Chip
                        label={label}
                        size="small"
                        color={diferencia > 0 ? 'success' : diferencia < 0 ? 'error' : 'default'}
                        variant="outlined"
                    />
                );
            },
        },
    ]), []);

    return (
        <Box sx={{ pt: 2 }}>
            {loadingHistorial && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, py: 4 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {!loadingHistorial && !error && !filtroActivo && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        {'Seleccioná un rango de fechas o presioná "Histórico" para ver los arqueos.'}
                    </Typography>
                </Box>
            )}
            {!loadingHistorial && !error && filtroActivo && datosCargados && (
                <>
                    <Tabla
                        titulo="Arqueos"
                        filas={arqueosFiltrados}
                        columnas={columnas}
                        paginacion={true}
                        rowsPerPage={5}
                        ajustarAlturaAlContenido={true}
                        renderBuscar={() => (
                            <BuscadorTabla
                                value={textoBusqueda}
                                onChange={setTextoBusqueda}
                                placeholder="Fecha, monto, diferencia..."
                            />
                        )}
                        onRefresh={cargarHistorial}
                        onRowClick={handleSeleccionArqueo}
                        getRowSx={(fila) => (
                            fila.id === cajaSeleccionada?.id
                                ? { backgroundColor: 'action.selected' }
                                : {}
                        )}
                    />
                    {!cajaSeleccionada && (
                        <Alert severity="info" icon={<SouthOutlinedIcon />} sx={{ mt: 2 }}>
                            {'Hacé click en un arqueo de la tabla superior para ver abajo sus movimientos.'}
                        </Alert>
                    )}
                    <Box sx={{ mt: 3 }}>
                        {cajaSeleccionada ? (
                            <Movimientos
                                cajaActiva={null}
                                cajaSeleccionada={cajaSeleccionada}
                                movimientos={movimientos}
                                loadingMovimientos={loadingMovimientos}
                                onRecargar={() => cargarMovimientos(cajaSeleccionada.id, cajaSeleccionada.montoInicial)}
                                onVolverACajaActiva={null}
                            />
                        ) : (
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack spacing={1} alignItems="center" py={4}>
                                        <SouthOutlinedIcon color="action" />
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Seleccioná un arqueo de la tabla superior para ver abajo sus movimientos.
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}
