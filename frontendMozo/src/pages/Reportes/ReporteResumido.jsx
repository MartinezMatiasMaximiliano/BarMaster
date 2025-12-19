import React from 'react';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { useFiltros } from './hooks/useFiltros';
import { useReportes } from './hooks/useReportes';
import FiltrosAvanzados from './components/FiltrosAvanzados';
import ResumenReporte from './components/ResumenReporte';

const ReporteResumido = () => {
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
                Reporte Resumido
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

            <ResumenReporte 
                metricas={reportes.metricas} 
                visitas={reportes.visitas || []} 
                mesas={reportes.mesas} 
                productos={reportes.productos} 
            />
        </Container>
    );
};

export default ReporteResumido;

