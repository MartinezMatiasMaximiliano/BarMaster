import React from 'react';
import {
    Alert,
    Box,
    Card,
    Container,
    Stack,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useCaja } from './hooks/useCaja';
import { EstadoActual } from './components/EstadoActual';
import { FormularioApertura } from './components/FormularioApertura';
import { FormularioCierre } from './components/FormularioCierre';
import { Historial } from './components/Historial';
import { Movimientos } from './components/Movimientos';
import { ObtenerHistorialCaja } from '../../API/APICaja';
import { obtenerMensajeError } from './utils/constants';
import { LoadingWrapper } from '../../components/common/LoadingWrapper';

function Caja() {
    const {
        cajaActiva,
        historial,
        movimientos,
        cajaSeleccionada,
        loadingCaja,
        loadingHistorial,
        loadingMovimientos,
        guardando,
        error,
        mensaje,
        tabValue,
        formApertura,
        formCierre,
        diferencia,
        balanceActual,
        setCajaSeleccionada,
        setTabValue,
        setError,
        setMensaje,
        setLoadingHistorial,
        setHistorial,
        cargarDatos,
        cargarMovimientos,
        handleClickArqueo,
        handleChange,
        onAbrirCaja,
        onCerrarCaja,
        setFormApertura,
        setFormCierre
    } = useCaja();

    const handleRefreshHistorial = async () => {
        setLoadingHistorial(true);
        try {
            const data = await ObtenerHistorialCaja({ limite: 5 });
            setHistorial(data ?? []);
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos cargar el historial.'));
        } finally {
            setLoadingHistorial(false);
        }
    };

    const handleVolverACajaActiva = () => {
        setCajaSeleccionada(null);
        setTabValue(1); // Asegurar que estamos en la pestaña de Movimientos
        if (cajaActiva?.id) {
            cargarMovimientos(cajaActiva.id);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <div>
                        <Typography variant="h4" gutterBottom>
                            Arqueo de Caja
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Controlá la apertura y el cierre diario desde un solo lugar.
                        </Typography>
                    </div>
                </Box>

                {error && (
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {mensaje && (
                    <Alert severity="success" onClose={() => setMensaje('')}>
                        {mensaje}
                    </Alert>
                )}

                <LoadingWrapper minHeight={300} sx={{ py: 6 }}>
                    <>
                        <EstadoActual cajaActiva={cajaActiva} balanceActual={balanceActual} onRecargar={cargarDatos} />
                        <Card variant="outlined">
                            <Tabs
                                value={tabValue}
                                onChange={(e, newValue) => setTabValue(newValue)}
                                sx={{ borderBottom: 1, borderColor: 'divider' }}
                            >
                                <Tab label="Arqueo" icon={<HistoryIcon />} iconPosition="start" />
                                <Tab 
                                    label="Movimientos" 
                                    icon={<ReceiptIcon />} 
                                    iconPosition="start"
                                    disabled={!cajaActiva && !cajaSeleccionada}
                                />
                            </Tabs>
                            <Box sx={{ p: 3 }}>
                                {tabValue === 0 && (
                                    <Stack spacing={3}>
                                        {cajaActiva ? (
                                            <FormularioCierre
                                                formCierre={formCierre}
                                                diferencia={diferencia}
                                                guardando={guardando}
                                                onChange={handleChange(setFormCierre)}
                                                onSubmit={onCerrarCaja}
                                            />
                                        ) : (
                                            <FormularioApertura
                                                formApertura={formApertura}
                                                guardando={guardando}
                                                onChange={handleChange(setFormApertura)}
                                                onSubmit={onAbrirCaja}
                                            />
                                        )}
                                        <Historial
                                            historial={historial}
                                            loadingHistorial={loadingHistorial}
                                            cajaSeleccionada={cajaSeleccionada}
                                            onRefresh={handleRefreshHistorial}
                                            onClickArqueo={handleClickArqueo}
                                        />
                                    </Stack>
                                )}
                                {tabValue === 1 && (
                                    <Movimientos
                                        cajaActiva={cajaActiva}
                                        cajaSeleccionada={cajaSeleccionada}
                                        movimientos={movimientos}
                                        loadingMovimientos={loadingMovimientos}
                                        onRecargar={() => cargarMovimientos(cajaSeleccionada?.id || cajaActiva?.id)}
                                        onVolverACajaActiva={handleVolverACajaActiva}
                                    />
                                )}
                            </Box>
                        </Card>
                    </>
                </LoadingWrapper>
            </Stack>
        </Container>
    );
}

export default Caja;

