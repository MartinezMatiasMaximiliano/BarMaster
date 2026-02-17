import React from 'react';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { useFiltros } from './hooks/useFiltros';
import { useReportes } from './hooks/useReportes';
import { useExportacion } from './hooks/useExportacion';
import FiltrosAvanzados from './components/FiltrosAvanzados';
import ExportarReporte from './components/ExportarReporte';

const ReporteCaja = () => {
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
                Reporte de Caja
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
                tipoReporte="caja"
                datos={reportes.visitas}
            />

            <Box sx={{ mb: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
                <Typography variant="body1">
                    Esta funcionalidad estará disponible próximamente con análisis detallado de cajas.
                </Typography>
            </Box>
        </Container>
    );
};

export default ReporteCaja;

