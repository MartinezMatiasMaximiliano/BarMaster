import { useState, useEffect } from 'react';
import { Alert, Box, Card, CardContent, CircularProgress, Container, IconButton, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ObtenerPlanEmpresa, ObtenerDatosEmpresa } from '../API/APIEmpresas';

const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
export default function Mi_Plan() {
    const [plan, setPlan] = useState(null);
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const cargar = async () => {
        setLoading(true);
        setError('');
        try {
            const [datosPlan, datosEmpresa] = await Promise.all([ObtenerPlanEmpresa(), ObtenerDatosEmpresa()]);
            setPlan(datosPlan || null);
            setEmpresa(datosEmpresa);
        } catch (err) {
            setError(err.message || 'No se pudo cargar la información del plan.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { cargar(); }, []);
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4">Mi Plan</Typography>
                    <IconButton onClick={cargar} aria-label="Recargar información" disabled={loading}><RefreshIcon /></IconButton>
                </Box>
                {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : <>
                    {empresa && <Typography variant="h6">{empresa.nombre}</Typography>}
                    {!plan ? <Alert severity="info">La empresa no tiene una suscripción asociada.</Alert> : <>
                        <Card variant="outlined"><CardContent>
                            <Stack spacing={1}>
                                <Typography variant="h5">{plan.nombre}</Typography>
                                <Typography color="text.secondary">Identificador del plan: {plan.id}</Typography>
                                <Typography>Precio: {moneda.format(plan.precio)}</Typography>
                            </Stack>
                        </CardContent></Card>
                        <Card variant="outlined"><CardContent>
                            <Typography variant="h6" gutterBottom>Prestaciones incluidas</Typography>
                            <Stack spacing={1}>
                                {(plan.prestaciones ?? []).map((prestacion, index) => <Stack key={index} direction="row" spacing={1}>
                                    <CheckCircleIcon color="success" /><Typography>{prestacion}</Typography>
                                </Stack>)}
                                {!plan.prestaciones?.length && <Typography color="text.secondary">No hay prestaciones informadas.</Typography>}
                            </Stack>
                        </CardContent></Card>
                    </>}
                </>}
            </Stack>
        </Container>
    );
}
