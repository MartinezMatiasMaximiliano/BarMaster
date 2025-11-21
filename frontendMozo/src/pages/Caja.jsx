import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import HistoryIcon from '@mui/icons-material/History';
import PaidIcon from '@mui/icons-material/Paid';
import { AbrirCaja, CerrarCaja, ObtenerCajaActiva, ObtenerHistorialCaja } from '../API/APICaja';

const buildTimestampDefaults = () => {
    const now = new Date();
    const pad = (value) => value.toString().padStart(2, '0');
    return {
        fecha: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        hora: `${pad(now.getHours())}:${pad(now.getMinutes())}`
    };
};

const initialApertura = () => ({
    ...buildTimestampDefaults(),
    montoInicial: ''
});

const initialCierre = () => ({
    ...buildTimestampDefaults(),
    montoFinal: '',
    observaciones: ''
});

function Caja() {
    const [cajaActiva, setCajaActiva] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loadingCaja, setLoadingCaja] = useState(true);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [formApertura, setFormApertura] = useState(initialApertura);
    const [formCierre, setFormCierre] = useState(initialCierre);

    const currencyFormatter = useMemo(
        () =>
            new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 2
            }),
        []
    );

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoadingCaja(true);
        setError('');
        try {
            const [caja, itemsHistorial] = await Promise.allSettled([
                ObtenerCajaActiva(),
                ObtenerHistorialCaja({ limite: 5 })
            ]);

            if (caja.status === 'fulfilled') {
                setCajaActiva(caja.value ?? null);
                setFormCierre((prev) => ({ ...prev, ...buildTimestampDefaults() }));
            } else {
                throw caja.reason;
            }

            if (itemsHistorial.status === 'fulfilled') {
                setHistorial(itemsHistorial.value ?? []);
            }
        } catch (err) {
            setCajaActiva(null);
            setError(obtenerMensajeError(err, 'No pudimos obtener el estado de la caja.'));
        } finally {
            setLoadingCaja(false);
        }
    };

    const obtenerMensajeError = (err, fallback) =>
        err?.response?.data?.error?.mensaje ||
        err?.response?.data?.mensaje ||
        err?.message ||
        fallback;

    const handleChange = (setter) => (event) => {
        const { name, value } = event.target;
        setter((prev) => ({ ...prev, [name]: value }));
    };

    const validarApertura = () => {
        if (!formApertura.fecha || !formApertura.hora) {
            setError('La fecha y hora de apertura son obligatorias.');
            return false;
        }
        if (!formApertura.montoInicial || Number(formApertura.montoInicial) < 0) {
            setError('El monto inicial debe ser un número positivo.');
            return false;
        }
        return true;
    };

    const validarCierre = () => {
        if (!formCierre.fecha || !formCierre.hora) {
            setError('La fecha y hora de cierre son obligatorias.');
            return false;
        }
        if (formCierre.montoFinal === '' || Number.isNaN(Number(formCierre.montoFinal))) {
            setError('Debes indicar el monto final real.');
            return false;
        }
        return true;
    };

    const onAbrirCaja = async (event) => {
        event.preventDefault();
        setMensaje('');
        setError('');

        if (!validarApertura()) {
            return;
        }

        setGuardando(true);
        try {
            const payload = {
                fechaApertura: formApertura.fecha,
                horaApertura: formApertura.hora,
                montoInicial: Number(formApertura.montoInicial)
            };
            const caja = await AbrirCaja(payload);
            setCajaActiva(caja);
            setFormCierre(initialCierre());
            setMensaje('La caja se abrió correctamente.');
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos abrir la caja.'));
        } finally {
            setGuardando(false);
        }
    };

    const onCerrarCaja = async (event) => {
        event.preventDefault();
        setMensaje('');
        setError('');

        if (!validarCierre()) {
            return;
        }

        setGuardando(true);
        try {
            const payload = {
                fechaCierre: formCierre.fecha,
                horaCierre: formCierre.hora,
                montoFinal: Number(formCierre.montoFinal),
                observaciones: formCierre.observaciones
            };
            await CerrarCaja(cajaActiva?.id, payload);
            setMensaje('La caja se cerró correctamente.');
            setCajaActiva(null);
            setFormApertura(initialApertura());
            setFormCierre(initialCierre());
            await cargarDatos();
        } catch (err) {
            setError(obtenerMensajeError(err, 'No pudimos cerrar la caja.'));
        } finally {
            setGuardando(false);
        }
    };

    const diferencia = useMemo(() => {
        if (!cajaActiva) {
            return 0;
        }
        const esperado =
            Number(cajaActiva?.montoEsperado ?? cajaActiva?.totalEsperado ?? cajaActiva?.montoInicial ?? 0);
        const final = Number(formCierre.montoFinal || 0);
        return final - esperado;
    }, [cajaActiva, formCierre.montoFinal]);

    const renderEstadoActual = () => (
        <Card variant="outlined">
            <CardHeader
                title="Estado de la caja"
                action={
                    <Tooltip title="Recargar">
                        <IconButton onClick={cargarDatos} size="small">
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                }
                subheader={
                    cajaActiva
                        ? `Abierta desde ${cajaActiva.fechaApertura ?? cajaActiva.fecha} ${cajaActiva.horaApertura ?? ''}`
                        : 'No hay ninguna caja abierta actualmente.'
                }
            />
            <Divider />
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                        color={cajaActiva ? 'success' : 'default'}
                        label={cajaActiva ? 'Caja abierta' : 'Caja cerrada'}
                    />
                    {cajaActiva && (
                        <Chip
                            icon={<PaidIcon />}
                            color="primary"
                            variant="outlined"
                            label={`Monto inicial: ${currencyFormatter.format(
                                cajaActiva.montoInicial ?? 0
                            )}`}
                        />
                    )}
                </Stack>
                {cajaActiva && (
                    <Stack spacing={1} mt={2}>
                        <Typography variant="body2">
                            Responsable:{' '}
                            <strong>{cajaActiva.responsable ?? cajaActiva.usuario ?? 'Sin asignar'}</strong>
                        </Typography>
                        <Typography variant="body2">
                            Ventas registradas: {currencyFormatter.format(cajaActiva.montoEsperado ?? 0)}
                        </Typography>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );

    const renderFormularioApertura = () => (
        <Card variant="outlined">
            <CardHeader
                title="Apertura de caja"
                subheader="Ingresa la fecha, horario y monto inicial disponible."
            />
            <Divider />
            <CardContent>
                <Box component="form" onSubmit={onAbrirCaja}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Fecha de apertura"
                                type="date"
                                name="fecha"
                                value={formApertura.fecha}
                                onChange={handleChange(setFormApertura)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Hora de apertura"
                                type="time"
                                name="hora"
                                value={formApertura.hora}
                                onChange={handleChange(setFormApertura)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Monto inicial"
                                type="number"
                                name="montoInicial"
                                value={formApertura.montoInicial}
                                onChange={handleChange(setFormApertura)}
                                fullWidth
                                inputProps={{ min: 0, step: '0.01' }}
                                required
                            />
                        </Grid>
                    </Grid>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<LockOpenIcon />}
                            disabled={guardando}
                        >
                            {guardando ? <CircularProgress size={20} color="inherit" /> : 'Abrir caja'}
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );

    const renderFormularioCierre = () => (
        <Card variant="outlined">
            <CardHeader title="Cierre de caja" subheader="Detalla el monto final y observaciones." />
            <Divider />
            <CardContent>
                <Box component="form" onSubmit={onCerrarCaja}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Fecha de cierre"
                                type="date"
                                name="fecha"
                                value={formCierre.fecha}
                                onChange={handleChange(setFormCierre)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Hora de cierre"
                                type="time"
                                name="hora"
                                value={formCierre.hora}
                                onChange={handleChange(setFormCierre)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Monto final real"
                                type="number"
                                name="montoFinal"
                                value={formCierre.montoFinal}
                                onChange={handleChange(setFormCierre)}
                                fullWidth
                                inputProps={{ min: 0, step: '0.01' }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Observaciones"
                                name="observaciones"
                                value={formCierre.observaciones}
                                onChange={handleChange(setFormCierre)}
                                fullWidth
                                multiline
                                minRows={1}
                                maxRows={4}
                                placeholder="Diferencias, billetes faltantes, etc."
                            />
                        </Grid>
                    </Grid>
                    <Stack spacing={1} mt={3}>
                        <Typography variant="body2" color="text.secondary">
                            Diferencia vs. esperado:{' '}
                            <strong
                                style={{
                                    color: diferencia === 0 ? 'inherit' : diferencia > 0 ? '#1b5e20' : '#b71c1c'
                                }}
                            >
                                {currencyFormatter.format(diferencia)}
                            </strong>
                        </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            startIcon={<LockIcon />}
                            disabled={guardando}
                        >
                            {guardando ? <CircularProgress size={20} color="inherit" /> : 'Cerrar caja'}
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );

    const renderHistorial = () => (
        <Card variant="outlined">
            <CardHeader
                title="Últimos arqueos"
                subheader="Referencias rápidas"
                avatar={<HistoryIcon color="action" />}
                action={
                    <Tooltip title="Refrescar historial">
                        <span>
                            <IconButton
                                size="small"
                                onClick={async () => {
                                    setLoadingHistorial(true);
                                    try {
                                        const data = await ObtenerHistorialCaja({ limite: 5 });
                                        setHistorial(data ?? []);
                                    } catch (err) {
                                        setError(obtenerMensajeError(err, 'No pudimos cargar el historial.'));
                                    } finally {
                                        setLoadingHistorial(false);
                                    }
                                }}
                            >
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                }
            />
            <Divider />
            <CardContent>
                {loadingHistorial ? (
                    <Stack alignItems="center" py={2}>
                        <CircularProgress size={28} />
                    </Stack>
                ) : historial.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Aún no hay movimientos recientes.
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {historial.map((item) => (
                            <Box
                                key={item.id ?? `${item.fechaApertura}-${item.fechaCierre}-${item.montoFinal}`}
                                sx={{
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    p: 1.5
                                }}
                            >
                                <Typography variant="subtitle2">
                                    {item.fechaApertura} {item.horaApertura} - {item.fechaCierre}{' '}
                                    {item.horaCierre}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Cerró con {currencyFormatter.format(item.montoFinal ?? 0)} (
                                    {currencyFormatter.format(item.diferencia ?? 0)})
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );

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

                {loadingCaja ? (
                    <Stack alignItems="center" py={6}>
                        <CircularProgress />
                    </Stack>
                ) : (
                    <>
                        {renderEstadoActual()}
                        {cajaActiva ? renderFormularioCierre() : renderFormularioApertura()}
                        {renderHistorial()}
                    </>
                )}
            </Stack>
        </Container>
    );
}

export default Caja;
