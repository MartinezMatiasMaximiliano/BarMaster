import React from 'react';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useFiltros } from './hooks/useFiltros';
import { useReportes } from './hooks/useReportes';
import { useExportacion } from './hooks/useExportacion';
import FiltrosAvanzados from './components/FiltrosAvanzados';
import ResumenReporte from './components/ResumenReporte';
import GraficaVentas from './reportes/ventas/GraficaVentas';
import GraficaProductos from './reportes/productos/GraficaProductos';
import GraficaMozos from './reportes/mozos/GraficaMozos';
import GraficaMesas from './reportes/mesas/GraficaMesas';
import ExportarReporte from './components/ExportarReporte';
import { boxDividerLineWithMargin } from '../../styles/boxStyles';

const Reportes = () => {
    const filtros = useFiltros();
    const reportes = useReportes(filtros);
    const exportacion = useExportacion();

    const renderContenidoReporte = () => {
        const tipoReporte = filtros.filtros.tipoReporte;

        switch (tipoReporte) {
            case 'ventas':
                return <GraficaVentas datosVentas={reportes.datosVentas} />;
            case 'productos':
                return <GraficaProductos datosProductos={reportes.datosProductos} />;
            case 'mozos':
                return <GraficaMozos datosMozos={reportes.datosMozos} />;
            case 'mesas':
                return <GraficaMesas datosMesas={reportes.datosMesas} />;
            case 'rentabilidad':
                return (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Resumen de Rentabilidad
                        </Typography>
                        <Typography variant="body1">
                            Total Ingresos: {reportes.datosRentabilidad.totalIngresos.toLocaleString('es-AR', {
                                style: 'currency',
                                currency: 'ARS'
                            })}
                        </Typography>
                        <Typography variant="body1">
                            Total Costos: {reportes.datosRentabilidad.totalCostos.toLocaleString('es-AR', {
                                style: 'currency',
                                currency: 'ARS'
                            })}
                        </Typography>
                        <Typography variant="body1">
                            Margen Total: {reportes.datosRentabilidad.margenTotal.toLocaleString('es-AR', {
                                style: 'currency',
                                currency: 'ARS'
                            })}
                        </Typography>
                        <Typography variant="body1">
                            Margen Porcentaje: {reportes.datosRentabilidad.margenPorcentaje.toFixed(2)}%
                        </Typography>
                    </Box>
                );
            case 'caja':
                return (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Reporte de Caja
                        </Typography>
                        <Typography variant="body1">
                            Esta funcionalidad estará disponible próximamente.
                        </Typography>
                    </>
                );
            default:
                return null;
        }
    };

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
                Reportes y Analytics
            </Typography>

            <FiltrosAvanzados
                filtros={filtros.filtros}
                actualizarFiltro={filtros.actualizarFiltro}
                limpiarFiltros={filtros.limpiarFiltros}
                mesas={reportes.mesas}
                categorias={reportes.categorias}
                tipoPagos={reportes.tipoPagos}
            />

            <ResumenReporte metricas={reportes.metricas} />

            <ExportarReporte
                onExportarPDF={exportacion.exportarAPDF}
                onExportarExcel={exportacion.exportarAExcel}
                tipoReporte={filtros.filtros.tipoReporte}
                datos={reportes.visitas}
            />

            <Box sx={boxDividerLineWithMargin}>
                {renderContenidoReporte()}
            </Box>
        </Container>
    );
};

export default Reportes;

