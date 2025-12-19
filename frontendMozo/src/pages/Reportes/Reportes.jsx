import React from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import { useFiltros } from './hooks/useFiltros';
import { useReportes } from './hooks/useReportes';
import { useExportacion } from './hooks/useExportacion';
import FiltrosAvanzados from './components/FiltrosAvanzados';
import ResumenReporte from './components/ResumenReporte';
import GraficaVentas from './components/GraficaVentas';
import GraficaProductos from './components/GraficaProductos';
import GraficaMozos from './components/GraficaMozos';
import GraficaMesas from './components/GraficaMesas';
import TablaDetallada from './components/TablaDetallada';
import ExportarReporte from './components/ExportarReporte';

const Reportes = () => {
    const filtros = useFiltros();
    const reportes = useReportes(filtros);
    const exportacion = useExportacion();

    const [tabValue, setTabValue] = React.useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const renderContenidoReporte = () => {
        const tipoReporte = filtros.filtros.tipoReporte;

        switch (tipoReporte) {
            case 'ventas':
                return (
                    <>
                        <GraficaVentas datosVentas={reportes.datosVentas} />
                        <TablaDetallada visitas={reportes.visitas} tipoReporte={tipoReporte} />
                    </>
                );
            case 'productos':
                return (
                    <>
                        <GraficaProductos datosProductos={reportes.datosProductos} />
                        <TablaDetallada visitas={reportes.visitas} tipoReporte={tipoReporte} />
                    </>
                );
            case 'mozos':
                return (
                    <>
                        <GraficaMozos datosMozos={reportes.datosMozos} />
                        <TablaDetallada visitas={reportes.visitas} tipoReporte={tipoReporte} />
                    </>
                );
            case 'mesas':
                return (
                    <>
                        <GraficaMesas datosMesas={reportes.datosMesas} />
                        <TablaDetallada visitas={reportes.visitas} tipoReporte={tipoReporte} />
                    </>
                );
            case 'rentabilidad':
                return (
                    <>
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
                        <TablaDetallada visitas={reportes.visitas} tipoReporte={tipoReporte} />
                    </>
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
                        <TablaDetallada visitas={reportes.visitas} tipoReporte={tipoReporte} />
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

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Gráficos" />
                    <Tab label="Tabla Detallada" />
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <Box>
                    {renderContenidoReporte()}
                </Box>
            )}

            {tabValue === 1 && (
                <TablaDetallada visitas={reportes.visitas} tipoReporte={filtros.filtros.tipoReporte} />
            )}
        </Container>
    );
};

export default Reportes;

