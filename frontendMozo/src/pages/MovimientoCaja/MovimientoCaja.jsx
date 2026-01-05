import React from 'react';
import { Alert, Box, CircularProgress, Container, Stack } from '@mui/material';
import { useMovimientoCaja } from './hooks/useMovimientoCaja';
import { FormularioMovimiento } from './components/FormularioMovimiento';
import { Header } from './components/Header';

function MovimientoCaja() {
    const {
        formData,
        cajaActiva,
        tiposMovimiento,
        loading,
        guardando,
        error,
        mensaje,
        errorMonto,
        balanceActual,
        handleChange,
        handleSubmit,
        limpiarMensajes
    } = useMovimientoCaja();

    const tipoSeleccionado = tiposMovimiento.find(
        (t) => t.id === Number(formData.idTipoMovimientoCaja)
    );

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={3}>
                <Header />

                {error && (
                    <Alert severity="error" onClose={limpiarMensajes}>
                        {error}
                    </Alert>
                )}

                {mensaje && (
                    <Alert severity="success" onClose={limpiarMensajes}>
                        {mensaje}
                    </Alert>
                )}

                {loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: 300,
                            py: 4
                        }}
                    >
                        <CircularProgress size={60} />
                    </Box>
                ) : (
                    <FormularioMovimiento
                        formData={formData}
                        cajaActiva={cajaActiva}
                        tiposMovimiento={tiposMovimiento}
                        guardando={guardando}
                        tipoSeleccionado={tipoSeleccionado}
                        errorMonto={errorMonto}
                        balanceActual={balanceActual}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                    />
                )}
            </Stack>
        </Container>
    );
}

export default MovimientoCaja;
