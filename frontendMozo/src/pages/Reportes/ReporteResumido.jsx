import React from 'react';
import { Container, Typography, CircularProgress, Alert, Box, TextField, Grid, Card, CardContent, Button, Stack } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useFiltros } from './hooks/useFiltros';
import { useReportes } from './hooks/useReportes';
import ResumenReporte from './components/ResumenReporte';

const ReporteResumido = () => {
    const filtros = useFiltros();
    const reportes = useReportes(filtros)
    
    console.log("REPORTES:", reportes);

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

            <Card variant="outlined" sx={{ mb: 4 }}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Fecha Inicio"
                                type="date"
                                value={filtros.filtros.fechaInicio}
                                onChange={(e) => filtros.actualizarFiltro('fechaInicio', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Fecha Fin"
                                type="date"
                                value={filtros.filtros.fechaFin}
                                onChange={(e) => filtros.actualizarFiltro('fechaFin', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                            <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={() => {
                                    filtros.actualizarFiltro('fechaInicio', '');
                                    filtros.actualizarFiltro('fechaFin', '');
                                }}
                                fullWidth
                            >
                                Limpiar
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

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

