import React from 'react';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { useFiltros } from './hooks/useFiltros';
import { useReportes } from './hooks/useReportes';
import { useExportacion } from './hooks/useExportacion';
import FiltrosAvanzados from './components/FiltrosAvanzados';
import GraficaMozos from './reportes/mozos/GraficaMozos';
import TablaDetallada from './components/TablaDetallada';
import ExportarReporte from './components/ExportarReporte';

const ReporteMozos = () => {
    const filtros = useFiltros();
    const reportes = useReportes(filtros);
    const exportacion = useExportacion();

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
                Reporte de Mozos
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

            <ExportarReporte
                onExportarPDF={exportacion.exportarAPDF}
                onExportarExcel={exportacion.exportarAExcel}
                tipoReporte="mozos"
                datos={reportes.visitas}
            />

            <GraficaMozos datosMozos={reportes.datosMozos} />

            <TablaDetallada visitas={reportes.visitas} tipoReporte="mozos" />
        </Container>
    );
};

export default ReporteMozos;

