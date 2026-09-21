import { useEffect } from 'react';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { usarImpresion } from '../../contexts/ContextoImpresion';

export default function EstadoQz() {
    const { estado, conectar } = usarImpresion();
    const comprobando = estado === 'inactivo' || estado === 'conectando';
    const listo = estado === 'conectado';

    useEffect(() => {
        if (estado === 'inactivo') conectar().catch(() => {});
    }, [estado, conectar]);

    const comprobar = () => conectar().catch(() => {});
    const color = listo ? 'success.dark' : comprobando ? 'text.secondary' : 'error.dark';
    const fondo = listo ? 'rgba(46, 125, 50, 0.08)' : comprobando ? 'action.hover' : 'rgba(211, 47, 47, 0.08)';

    return <Paper
        variant="outlined"
        role="status"
        aria-live="polite"
        sx={{ p: 2, borderColor: color, bgcolor: fondo }}
    >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
                {comprobando
                    ? <CircularProgress size={28} color="inherit" />
                    : listo
                        ? <CheckCircleRoundedIcon sx={{ fontSize: 32, color: 'success.dark' }} />
                        : <CancelRoundedIcon sx={{ fontSize: 32, color: 'error.dark' }} />}
                <Box>
                    <Typography fontWeight={800} color={color}>
                        {comprobando ? 'Comprobando estado de impresión…' : listo ? 'Esta PC está lista para imprimir' : 'Esta PC no está lista para imprimir'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {listo
                            ? 'El servicio de impresión está conectado correctamente.'
                            : comprobando
                                ? 'Estamos verificando la conexión con el servicio de impresión.'
                                : 'Abrí o instalá el programa de impresión y volvé a comprobar la conexión.'}
                    </Typography>
                </Box>
            </Stack>
            {!listo && !comprobando && <Button variant="outlined" color="error" startIcon={<RefreshRoundedIcon />} onClick={comprobar}>
                Volver a comprobar
            </Button>}
        </Stack>
    </Paper>;
}
