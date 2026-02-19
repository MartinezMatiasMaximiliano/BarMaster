import React from 'react';
import { Container, Typography, CircularProgress, Alert, Box, Card, CardContent } from '@mui/material';
import { useFiltros } from './hooks/useFiltros';
import { useReportes } from './hooks/useReportes';
import FiltrosAvanzados from './components/FiltrosAvanzados';
import { formatearMoneda, formatearPorcentaje } from './utils/formatters';

const ReporteRentabilidad = () => {
    const filtros = useFiltros();
    const reportes = useReportes(filtros);

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
            />

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
                        <Typography variant="body1" sx={{ color: (reportes.datosRentabilidad?.margenTotal || 0) >= 0 ? 'success.main' : 'error.main' }}>
                            <strong>Margen Total:</strong> {formatearMoneda(reportes.datosRentabilidad?.margenTotal || 0)}
                        </Typography>
                        <Typography variant="body1" sx={{ color: (reportes.datosRentabilidad?.margenPorcentaje || 0) >= 0 ? 'success.main' : 'error.main' }}>
                            <strong>Margen Porcentaje:</strong> {formatearPorcentaje(reportes.datosRentabilidad?.margenPorcentaje || 0)}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default ReporteRentabilidad;

