import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Container,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { ObtenerHistorialCaja } from '../../API/APICaja';
import { obtenerMensajeError } from './utils/constants';
import { LoadingWrapper } from '../../components/common/LoadingWrapper';
import { Historial as HistorialComponent } from './components/Historial';
import { Movimientos } from './components/Movimientos';
import { useCajaHistorial } from './hooks/useCajaHistorial';

function Historial() {
    const [historialCompleto, setHistorialCompleto] = useState([]);
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [loadingHistorial, setLoadingHistorial] = useState(true);
    const [error, setError] = useState('');
    const [cajaSeleccionada, setCajaSeleccionada] = useState(null);

    const {
        movimientos,
        loadingMovimientos,
        cargarMovimientos
    } = useCajaHistorial();

    // Filtrar arqueos por fecha seleccionada (busca en fecha de apertura o fecha de cierre)
    const historialFiltrado = useMemo(() => {
        if (!fechaSeleccionada) {
            return [];
        }
        return historialCompleto.filter(caja => {
            const fechaApertura = caja.fechaApertura;
            const fechaCierre = caja.fechaCierre;
            // Coincide si la fecha seleccionada es igual a la fecha de apertura o a la fecha de cierre
            return fechaApertura === fechaSeleccionada || fechaCierre === fechaSeleccionada;
        });
    }, [historialCompleto, fechaSeleccionada]);

    const cargarDatos = async () => {
        setLoadingHistorial(true);
        setError('');
        try {
            const data = await ObtenerHistorialCaja({ limite: 1000 });
            setHistorialCompleto(data ?? []);
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos cargar el historial.'));
        } finally {
            setLoadingHistorial(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleClickArqueo = (arqueo) => {
        if (cajaSeleccionada?.id === arqueo.id) {
            setCajaSeleccionada(null);
        } else {
            setCajaSeleccionada(arqueo);
            cargarMovimientos(arqueo.id, arqueo.montoInicial);
        }
    };

    const handleFechaChange = (event) => {
        const nuevaFecha = event.target.value;
        setFechaSeleccionada(nuevaFecha);
        setCajaSeleccionada(null); // Limpiar selección al cambiar fecha
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={3}>

                {error && (
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <TextField
                            label="Seleccionar fecha"
                            type="date"
                            value={fechaSeleccionada}
                            onChange={handleFechaChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            disabled={loadingHistorial}
                        />
                    </CardContent>
                </Card>

                <LoadingWrapper minHeight={300} sx={{ py: 6 }}>
                    <Stack spacing={3}>
                        <HistorialComponent
                            historial={historialFiltrado}
                            loadingHistorial={loadingHistorial}
                            cajaSeleccionada={cajaSeleccionada}
                            onRefresh={cargarDatos}
                            onClickArqueo={handleClickArqueo}
                        />
                        {cajaSeleccionada ? (
                            <Movimientos
                                cajaActiva={null}
                                cajaSeleccionada={cajaSeleccionada}
                                movimientos={movimientos}
                                loadingMovimientos={loadingMovimientos}
                                onRecargar={() => cargarMovimientos(cajaSeleccionada.id, cajaSeleccionada.montoInicial)}
                                onVolverACajaActiva={null}
                            />
                        ) : (
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
                                        Seleccioná una caja del historial para ver sus movimientos.
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                    </Stack>
                </LoadingWrapper>
            </Stack>
        </Container>
    );
}

export default Historial;

