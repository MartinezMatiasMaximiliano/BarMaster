import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { eliminarReglaImpresion, obtenerImpresoras, obtenerReglasImpresion, guardarReglaImpresion } from '../../../services/impresion/apiImpresion';
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
const FORMULARIO_INICIAL = { idImpresora: '', tipoSalida: 'Comanda', momento: 'AlCargarProductosMesa' };

export default function ReglasImpresion({ integrada = false, encabezado = null, bloqueadaPorCaja = false }) {
    const [impresoras, establecerImpresoras] = useState([]);
    const [reglas, establecerReglas] = useState([]);
    const [aviso, establecerAviso] = useState(null);
    const [formulario, establecerFormulario] = useState(FORMULARIO_INICIAL);
    const [mostrandoFormulario, establecerMostrandoFormulario] = useState(!integrada);

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
        establecerFormulario(FORMULARIO_INICIAL);
        establecerMostrandoFormulario(false);
        establecerAviso({ severity: 'success', text: 'Regla de impresión guardada.' });
    };

    const eliminarRegla = async (regla) => {
        if (!window.confirm(`¿Eliminar la regla de ${regla.nombreVisibleImpresora}?`)) return;
        await eliminarReglaImpresion(regla.id);
        await cargar();
        establecerAviso({ severity: 'success', text: 'Regla de impresión eliminada.' });
    };
    const botonAgregar = <Tooltip title="Agregar regla">
        <span>
            <IconButton
                aria-label="Agregar regla"
                disabled={mostrandoFormulario}
                onClick={() => establecerMostrandoFormulario(true)}
                sx={{
                    bgcolor: 'primary.dark',
                    color: 'common.white',
                    flexShrink: 0,
                    '&:hover': { bgcolor: 'primary.dark', boxShadow: '0 4px 14px rgba(59, 95, 217, 0.35)' },
                    '&.Mui-disabled': { bgcolor: 'primary.dark', color: 'common.white', opacity: 0.55 },
                }}
            >
                <AddIcon sx={{ color: 'inherit' }} />
            </IconButton>
        </span>
    </Tooltip>;

    return <Stack spacing={3} sx={{ maxWidth: integrada ? 'none' : 1000, mx: integrada ? 0 : 'auto', pb: integrada ? 0 : 4 }}>
        {!integrada && <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box><Typography variant="h4">Reglas de impresión</Typography><Typography color="text.secondary">Cada regla envía una impresión a una única impresora.</Typography></Box>
            {botonAgregar}
        </Stack>}
        {encabezado && <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            {encabezado}
            {botonAgregar}
        </Stack>}
        {aviso && <Alert severity={aviso.severity} onClose={() => establecerAviso(null)}>{aviso.text}</Alert>}

        {mostrandoFormulario && <Card variant="outlined"><CardContent><Stack spacing={2}>
            <Typography variant="h6">Nueva regla</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth><InputLabel>Impresora</InputLabel><Select label="Impresora" value={formulario.idImpresora} onChange={(event) => establecerFormulario({ ...formulario, idImpresora: event.target.value })}>{impresorasHabilitadas.map((impresora) => <MenuItem key={impresora.id} value={impresora.id}>{impresora.nombreVisible} — {impresora.nombreEstacion}{!impresora.estacionEnLinea ? ' (equipo desconectado)' : ''}</MenuItem>)}</Select></FormControl>
                <FormControl fullWidth><InputLabel>Qué se imprime</InputLabel><Select label="Qué se imprime" value={formulario.tipoSalida} onChange={(evento) => establecerFormulario({ ...formulario, tipoSalida: evento.target.value })}>{TIPOS_IMPRESION.map((tipo) => <MenuItem key={tipo.valor} value={tipo.valor}>{tipo.etiqueta}</MenuItem>)}</Select></FormControl>
                <FormControl fullWidth><InputLabel>Cuándo</InputLabel><Select label="Cuándo" value={formulario.momento} onChange={(evento) => establecerFormulario({ ...formulario, momento: evento.target.value })}>{OPCIONES_MOMENTO.map((opcion) => <MenuItem key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</MenuItem>)}</Select></FormControl>
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => {
                    establecerFormulario(FORMULARIO_INICIAL);
                    establecerMostrandoFormulario(false);
                }}>Cancelar</Button>
                <Button variant="contained" onClick={() => guardarRegla().catch(mostrarError)}>Guardar regla</Button>
            </Stack>
        </Stack></CardContent></Card>}

        <Stack spacing={1.5}>
            <Typography variant="h6">Reglas activas</Typography>
            {reglas.length === 0
                ? <Typography color="text.secondary">No hay reglas configuradas.</Typography>
                : <TableContainer component={Card} variant="outlined">
                    <Table size="small" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Impresora</TableCell>
                                <TableCell>Qué imprime</TableCell>
                                <TableCell>Cuándo</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reglas.map((regla) => <TableRow key={regla.id} hover>
                                <TableCell><Typography fontWeight={600}>{regla.nombreVisibleImpresora}</Typography></TableCell>
                                <TableCell><Chip size="small" label={etiquetaTipo(regla.tipoSalida)} color={regla.tipoSalida === 'Comanda' ? 'primary' : 'secondary'} /></TableCell>
                                <TableCell>{etiquetaMomento(regla.momento)}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title={bloqueadaPorCaja ? 'No se puede eliminar mientras haya una caja activa' : ''}>
                                        <span><Button size="small" color="error" disabled={bloqueadaPorCaja} onClick={() => eliminarRegla(regla).catch(mostrarError)}>Eliminar</Button></span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </TableContainer>}
        </Stack>
    </Stack>;
}
