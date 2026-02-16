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
import { Movimientos } from './components/Movimientos';
import { LoadingWrapper } from '../../components/common/LoadingWrapper';

function Caja() {
    const {
        cajaActiva,
        movimientos,
        loadingCaja,
        loadingMovimientos,
        guardando,
        error,
        mensaje,
        tabValue,
        formApertura,
        formCierre,
        diferencia,
        balanceActual,
        balanceNoEfectivo,
        setTabValue,
        setError,
        setMensaje,
        cargarDatos,
        cargarMovimientos,
        handleChange,
        onAbrirCaja,
        onCerrarCaja,
        setFormApertura,
        setFormCierre
    } = useCaja();

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
                        <EstadoActual cajaActiva={cajaActiva} balanceActual={balanceActual} balanceNoEfectivo={balanceNoEfectivo} onRecargar={cargarDatos} />
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
                                    disabled={!cajaActiva}
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
                                    </Stack>
                                )}
                                {tabValue === 1 && (
                                    <Movimientos
                                        cajaActiva={cajaActiva}
                                        cajaSeleccionada={null}
                                        movimientos={movimientos}
                                        loadingMovimientos={loadingMovimientos}
                                        onRecargar={() => cargarMovimientos(cajaActiva?.id)}
                                        onVolverACajaActiva={null}
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

