import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { obtenerImpresoras, obtenerReglasImpresion, solicitarPruebaRemotaImpresora, guardarReglaImpresion, validarReglasImpresion } from '../../../services/impresion/apiImpresion';
import { normalizarErrorQz } from '../../../services/impresion/erroresQz';

const TIPOS_IMPRESION = [
    { valor: 'Comanda', etiqueta: 'Comanda' },
    { valor: 'Ticket', etiqueta: 'Ticket' },
];

const OPCIONES_MOMENTO = [
    { valor: 'AlCargarProductosMesa', etiqueta: 'Al cargar productos a una mesa' },
    { valor: 'AlCobrarProductosFacturados', etiqueta: 'Al cobrar productos facturados' },
    { valor: 'AlGenerarPreticket', etiqueta: 'Al generar preticket' },
    { valor: 'AlCobrarProductosSinFacturar', etiqueta: 'Al cobrar productos sin facturar' },
];

const etiquetaTipo = (valor) => TIPOS_IMPRESION.find((opcion) => opcion.valor === valor)?.etiqueta || valor;
const etiquetaMomento = (valor) => OPCIONES_MOMENTO.find((opcion) => opcion.valor === valor)?.etiqueta || valor;

export default function ReglasImpresion({ integrada = false }) {
    const [impresoras, establecerImpresoras] = useState([]);
    const [reglas, establecerReglas] = useState([]);
    const [aviso, establecerAviso] = useState(null);
    const [formulario, establecerFormulario] = useState({ idImpresora: '', tipoSalida: 'Comanda', momento: 'AlCargarProductosMesa' });

    const cargar = async () => {
        const [listaImpresoras, listaReglas] = await Promise.all([obtenerImpresoras(), obtenerReglasImpresion()]);
        establecerImpresoras(listaImpresoras);
        establecerReglas(listaReglas);
    };
    const mostrarError = useCallback((error) => establecerAviso({ severity: 'error', text: normalizarErrorQz(error).mensaje }), []);
    useEffect(() => { cargar().catch(mostrarError); }, [mostrarError]);
    const impresorasHabilitadas = useMemo(() => impresoras.filter((impresora) => impresora.habilitada), [impresoras]);

    const guardarRegla = async () => {
        if (!formulario.idImpresora) return establecerAviso({ severity: 'warning', text: 'Elegí una impresora.' });
        await guardarReglaImpresion({ id: null, ...formulario, habilitada: true });
        await cargar();
        establecerAviso({ severity: 'success', text: 'Regla de impresión guardada.' });
    };

    const validar = async () => {
        const resultado = await validarReglasImpresion();
        establecerAviso({ severity: resultado.esValida ? 'success' : 'warning', text: resultado.esValida ? 'La configuración está completa.' : resultado.problemas.map((problema) => problema.mensaje).join(' ') });
    };

    return <Stack spacing={3} sx={{ maxWidth: integrada ? 'none' : 1000, mx: integrada ? 0 : 'auto', pb: integrada ? 0 : 4 }}>
        {!integrada && <Box><Typography variant="h4">Reglas de impresión</Typography><Typography color="text.secondary">Cada regla envía una impresión a una única impresora.</Typography></Box>}
        {aviso && <Alert severity={aviso.severity} onClose={() => establecerAviso(null)}>{aviso.text}</Alert>}

        <Card variant="outlined"><CardContent><Stack spacing={2}>
            <Typography variant="h6">Nueva regla</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth><InputLabel>Impresora</InputLabel><Select label="Impresora" value={formulario.idImpresora} onChange={(event) => establecerFormulario({ ...formulario, idImpresora: event.target.value })}>{impresorasHabilitadas.map((impresora) => <MenuItem key={impresora.id} value={impresora.id}>{impresora.nombreVisible} — {impresora.nombreEstacion}{!impresora.estacionEnLinea ? ' (equipo desconectado)' : ''}</MenuItem>)}</Select></FormControl>
                <FormControl fullWidth><InputLabel>Qué se imprime</InputLabel><Select label="Qué se imprime" value={formulario.tipoSalida} onChange={(evento) => establecerFormulario({ ...formulario, tipoSalida: evento.target.value })}>{TIPOS_IMPRESION.map((tipo) => <MenuItem key={tipo.valor} value={tipo.valor}>{tipo.etiqueta}</MenuItem>)}</Select></FormControl>
                <FormControl fullWidth><InputLabel>Cuándo</InputLabel><Select label="Cuándo" value={formulario.momento} onChange={(evento) => establecerFormulario({ ...formulario, momento: evento.target.value })}>{OPCIONES_MOMENTO.map((opcion) => <MenuItem key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</MenuItem>)}</Select></FormControl>
            </Stack>
            <Button variant="contained" onClick={() => guardarRegla().catch(mostrarError)}>Guardar regla</Button>
        </Stack></CardContent></Card>

        <Card variant="outlined"><CardContent><Stack spacing={2}>
            <Typography variant="h6">Reglas activas</Typography>
            {reglas.length === 0 ? <Typography color="text.secondary">No hay reglas configuradas.</Typography> : reglas.map((regla) => <Stack key={regla.id} direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={1.5} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Chip size="small" label={etiquetaTipo(regla.tipoSalida)} color={regla.tipoSalida === 'Comanda' ? 'primary' : 'secondary'} />
                <Typography sx={{ flex: 1 }}><strong>{regla.nombreVisibleImpresora}</strong> · {regla.nombreEstacion}</Typography>
                <Typography variant="body2" color="text.secondary">{etiquetaMomento(regla.momento)}</Typography>
            </Stack>)}
            <Button sx={{ alignSelf: 'flex-start' }} variant="outlined" onClick={() => validar().catch(mostrarError)}>Revisar configuración</Button>
        </Stack></CardContent></Card>

        <Card variant="outlined"><CardContent><Typography variant="h6">Probar una impresora remota</Typography><Typography color="text.secondary" sx={{ mb: 1 }}>La prueba viajará por el servidor hasta el equipo conectado por SignalR.</Typography>{impresoras.map((impresora) => <Button key={impresora.id} sx={{ mr: 1, mb: 1 }} variant="outlined" disabled={!impresora.habilitada} onClick={() => solicitarPruebaRemotaImpresora(impresora.id).then(() => establecerAviso({ severity: 'success', text: `Prueba enviada a ${impresora.nombreVisible}.` })).catch(mostrarError)}>Probar {impresora.nombreVisible}</Button>)}</CardContent></Card>
    </Stack>;
}
