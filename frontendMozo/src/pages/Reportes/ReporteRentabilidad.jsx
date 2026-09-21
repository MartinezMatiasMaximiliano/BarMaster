import React, { useCallback, useEffect, useRef } from 'react';
import { Container, Typography, CircularProgress, Alert, Box, Card, CardContent } from '@mui/material';
import { useFiltros } from './hooks/useFiltros';
import { useReportes } from './hooks/useReportes';
import FiltrosAvanzados from './components/FiltrosAvanzados';
import { formatearMoneda, formatearPorcentaje } from './utils/formatters';

const ReporteRentabilidad = () => {
    const filtros = useFiltros();
    const reportes = useReportes(filtros);
    const prevFechasRef = useRef({ fechaInicio: '', fechaFin: '' });

    const handleBuscar = useCallback(() => reportes.cargarVisitas(), [reportes.cargarVisitas]);
    const handleHistorico = useCallback(() => {
        filtros.actualizarFiltro('fechaInicio', '');
        filtros.actualizarFiltro('fechaFin', '');
        reportes.cargarVisitas();
    }, [filtros.actualizarFiltro, reportes.cargarVisitas]);

    useEffect(() => {
        if (filtros.filtros.fechaInicio && filtros.filtros.fechaFin) {
            const prev = prevFechasRef.current;
            if (prev.fechaInicio !== filtros.filtros.fechaInicio || prev.fechaFin !== filtros.filtros.fechaFin) {
                prevFechasRef.current = { fechaInicio: filtros.filtros.fechaInicio, fechaFin: filtros.filtros.fechaFin };
                reportes.cargarVisitas();
            }
        }
    }, [filtros.filtros.fechaInicio, filtros.filtros.fechaFin]);

    if (reportes.loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (reportes.error) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {reportes.error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Reporte de Rentabilidad
            </Typography>

            <FiltrosAvanzados
                filtros={filtros.filtros}
                actualizarFiltro={filtros.actualizarFiltro}
                limpiarFiltros={filtros.limpiarFiltros}
                mesas={reportes.mesas}
                categorias={reportes.categorias}
                tipoPagos={reportes.tipoPagos}
                ocultarTipoReporte={true}
                onBuscar={handleBuscar}
                onHistorico={handleHistorico}
            />

            {!reportes.datosCargados ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        Seleccioná un rango de fechas para ver los datos, o presioná "Histórico" para ver todo.
                    </Typography>
                </Box>
            ) : (
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Resumen de Rentabilidad
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <Typography variant="body1">
                                <strong>Total Ingresos:</strong> {formatearMoneda(reportes.datosRentabilidad?.totalIngresos || 0)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total Costos:</strong> {formatearMoneda(reportes.datosRentabilidad?.totalCostos || 0)}
                            </Typography>
                            <Typography variant="body1" sx={{ color: (reportes.datosRentabilidad?.margenTotal || 0) >= 0 ? 'success.dark' : 'error.dark' }}>
                                <strong>Margen Total:</strong> {formatearMoneda(reportes.datosRentabilidad?.margenTotal || 0)}
                            </Typography>
                            <Typography variant="body1" sx={{ color: (reportes.datosRentabilidad?.margenPorcentaje || 0) >= 0 ? 'success.dark' : 'error.dark' }}>
                                <strong>Margen Porcentaje:</strong> {formatearPorcentaje(reportes.datosRentabilidad?.margenPorcentaje || 0)}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default ReporteRentabilidad;
