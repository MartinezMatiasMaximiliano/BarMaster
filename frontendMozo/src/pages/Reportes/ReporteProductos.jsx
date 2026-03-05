import React, { useCallback } from 'react';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { useFiltros } from './hooks/useFiltros';
import { useReportes } from './hooks/useReportes';
import FiltrosAvanzados from './components/FiltrosAvanzados';
import GraficaProductos from './reportes/productos/GraficaProductos';

const ReporteProductos = () => {
    const filtros = useFiltros();
    const reportes = useReportes(filtros);

    const handleBuscar = useCallback(() => reportes.cargarVisitas(), [reportes.cargarVisitas]);
    const handleHistorico = useCallback(() => {
        filtros.actualizarFiltro('fechaInicio', '');
        filtros.actualizarFiltro('fechaFin', '');
        reportes.cargarVisitas();
    }, [filtros.actualizarFiltro, reportes.cargarVisitas]);

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
                Reporte de Productos
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
                <GraficaProductos datosProductos={reportes.datosProductos} />
            )}
        </Container>
    );
};

export default ReporteProductos;
