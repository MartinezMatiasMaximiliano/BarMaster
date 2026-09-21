import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Switch, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { eliminarReglaImpresion, obtenerImpresoras, obtenerReglasImpresion, guardarReglaImpresion } from '../../../services/impresion/apiImpresion';
import { normalizarErrorQz } from '../../../services/impresion/erroresQz';

const ACCIONES = [
    { titulo: 'Comandas', descripcion: 'Al enviar productos a una mesa.', tipoSalida: 'Comanda', momento: 'AlCargarProductosMesa' },
    { titulo: 'Cuenta previa', descripcion: 'Al presionar “Imprimir cuenta”, antes de cobrar.', tipoSalida: 'Ticket', momento: 'AlGenerarPreticket' },
    { titulo: 'Comprobante de pago', descripcion: 'Después de confirmar “Cobrar todo” o “Cobrar por partes”.', tipoSalida: 'Ticket', momento: 'AlCobrarProductosSinFacturar' },
];
const corresponde = (regla, accion) => regla.tipoSalida === accion.tipoSalida && regla.momento === accion.momento && regla.compatible !== false;
const nombreImpresora = (impresora) => `${impresora.nombreVisible} — ${impresora.nombreEstacion}${!impresora.estacionEnLinea ? ' (equipo desconectado)' : ''}`;

export default function ReglasImpresion({ integrada = false, encabezado = null, bloqueadaPorCaja = false, versionImpresoras = 0 }) {
    const [impresoras, establecerImpresoras] = useState([]);
    const [reglas, establecerReglas] = useState([]);
    const [aviso, establecerAviso] = useState(null);
    const [cargando, establecerCargando] = useState(true);
    const [errorCarga, establecerErrorCarga] = useState(false);
    const [guardando, establecerGuardando] = useState(false);
    const [agregando, establecerAgregando] = useState({});
    const enCurso = useRef(false);

    const cargar = useCallback(async () => {
        establecerCargando(true);
        try {
            const [listaImpresoras, listaReglas] = await Promise.all([obtenerImpresoras(), obtenerReglasImpresion()]);
            establecerImpresoras(listaImpresoras);
            establecerReglas(listaReglas);
            establecerErrorCarga(false);
        } catch (error) {
            establecerErrorCarga(true);
            establecerAviso({ severity: 'error', text: normalizarErrorQz(error).mensaje });
        } finally { establecerCargando(false); }
    }, []);
    useEffect(() => { cargar(); }, [cargar, versionImpresoras]);

    const guardar = async (accion, regla, cambios) => {
        if (enCurso.current) return;
        enCurso.current = true;
        establecerGuardando(true);
        try {
            const guardada = await guardarReglaImpresion({
                id: regla?.id ?? null, idImpresora: regla?.idImpresora,
                tipoSalida: accion.tipoSalida, momento: accion.momento,
                habilitada: regla?.habilitada ?? true, ...cambios,
            });
            establecerReglas((actuales) => actuales.some((item) => item.id === guardada.id)
                ? actuales.map((item) => item.id === guardada.id ? guardada : item)
                : [...actuales, guardada]);
            establecerAgregando((actual) => ({ ...actual, [accion.momento]: false }));
            establecerAviso({ severity: 'success', text: 'Destino de impresión guardado.' });
        } catch (error) {
            establecerAviso({ severity: 'error', text: normalizarErrorQz(error).mensaje });
        } finally { enCurso.current = false; establecerGuardando(false); }
    };

    const quitar = async (regla) => {
        if (enCurso.current || bloqueadaPorCaja || !window.confirm(`¿Quitar ${regla.nombreVisibleImpresora} de esta impresión?`)) return;
        enCurso.current = true;
        establecerGuardando(true);
        try {
            await eliminarReglaImpresion(regla.id);
            establecerReglas((actuales) => actuales.filter((item) => item.id !== regla.id));
            establecerAviso({ severity: 'success', text: 'Destino de impresión quitado.' });
        } catch (error) {
            establecerAviso({ severity: 'error', text: normalizarErrorQz(error).mensaje });
        } finally { enCurso.current = false; establecerGuardando(false); }
    };
    const botonQuitar = (regla) => <Tooltip title={bloqueadaPorCaja ? 'No se puede quitar mientras haya una caja activa' : ''}>
        <span><Button size="small" color="error" disabled={guardando || bloqueadaPorCaja} onClick={() => quitar(regla)}>Quitar</Button></span>
    </Tooltip>;
    const anteriores = reglas.filter((regla) => !ACCIONES.some((accion) => corresponde(regla, accion)));

    return <Stack spacing={3} sx={{ maxWidth: integrada ? 'none' : 1000, mx: integrada ? 0 : 'auto', pb: integrada ? 0 : 4 }}>
        {encabezado || (!integrada && <Box><Typography variant="h4">Impresión automática</Typography><Typography color="text.secondary">Elegí dónde se imprime cada documento.</Typography></Box>)}
        {aviso && <Alert severity={aviso.severity} onClose={() => establecerAviso(null)}>{aviso.text}</Alert>}
        {cargando ? <Typography color="text.secondary">Cargando destinos de impresión…</Typography> : errorCarga ?
            <Button onClick={cargar}>Volver a cargar</Button> : <>
            {impresoras.filter((impresora) => impresora.habilitada).length === 0 && <Alert severity="info">Buscá y habilitá una impresora en el paso anterior para asignarle documentos.</Alert>}
            <Typography variant="body2" color="text.secondary">Los cambios se guardan automáticamente. Podés enviar el mismo documento a varias impresoras.</Typography>
            {ACCIONES.map((accion) => {
                const destinos = reglas.filter((regla) => corresponde(regla, accion));
                const disponibles = impresoras.filter((impresora) => impresora.habilitada && !destinos.some((regla) => regla.idImpresora === impresora.id));
                const selector = (regla) => {
                    const opciones = impresoras.filter((impresora) => impresora.id === regla?.idImpresora || (impresora.habilitada && !destinos.some((destino) => destino.idImpresora === impresora.id)));
                    const labelId = `${accion.momento}-${regla?.id ?? 'nueva'}`;
                    return <FormControl fullWidth size="small" sx={{ flex: 1 }} disabled={guardando || (!regla && disponibles.length === 0)}>
                        <InputLabel id={labelId}>Impresora</InputLabel>
                        <Select labelId={labelId} label="Impresora" value={regla?.idImpresora ?? ''} onChange={(event) => guardar(accion, regla, { idImpresora: event.target.value })}>
                            {!regla && <MenuItem value="" disabled>Elegí una impresora</MenuItem>}
                            {regla && !opciones.some((impresora) => impresora.id === regla.idImpresora) && <MenuItem value={regla.idImpresora}>{regla.nombreVisibleImpresora} — {regla.nombreEstacion} (no disponible)</MenuItem>}
                            {opciones.map((impresora) => <MenuItem key={impresora.id} value={impresora.id}>{nombreImpresora(impresora)}</MenuItem>)}
                        </Select>
                    </FormControl>;
                };
                return <Card key={accion.momento} variant="outlined" component="section" aria-label={accion.titulo} sx={{ borderRadius: 2 }}><CardContent><Stack spacing={2}>
                    <Box><Typography variant="h6">{accion.titulo}</Typography><Typography variant="body2" color="text.secondary">{accion.descripcion}</Typography></Box>
                    {destinos.map((regla) => <Stack key={regla.id} spacing={1}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                            {selector(regla)}
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <FormControlLabel sx={{ mr: 1, minWidth: 140 }} label={regla.habilitada ? 'Activado' : 'Desactivado'} control={<Switch checked={regla.habilitada} disabled={guardando} slotProps={{ input: { 'aria-label': `Activar ${accion.titulo} en ${regla.nombreVisibleImpresora}` } }} onChange={(_, checked) => guardar(accion, regla, { habilitada: checked })} />} />
                                {botonQuitar(regla)}
                            </Stack>
                        </Stack>
                        {regla.habilitada && regla.disponible === false && <Typography variant="caption" color="warning.main">La impresora no está disponible en este momento.</Typography>}
                    </Stack>)}
                    {destinos.length === 0 && <Typography variant="body2" color="text.secondary">Sin impresora asignada.</Typography>}
                    {(destinos.length === 0 || agregando[accion.momento]) && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        {selector(null)}
                        {destinos.length > 0 && <Button disabled={guardando} onClick={() => establecerAgregando((actual) => ({ ...actual, [accion.momento]: false }))}>Cancelar</Button>}
                    </Stack>}
                    {destinos.length > 0 && !agregando[accion.momento] && <Button startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }} disabled={guardando || disponibles.length === 0} onClick={() => establecerAgregando((actual) => ({ ...actual, [accion.momento]: true }))}>Agregar otra impresora</Button>}
                </Stack></CardContent></Card>;
            })}
            {anteriores.length > 0 && <Card variant="outlined"><CardContent><Stack spacing={2}>
                <Typography variant="h6">Configuraciones anteriores</Typography>
                <Typography variant="body2" color="text.secondary">Estos destinos no son compatibles. Podés desactivarlos o quitarlos y asignar una impresora en las secciones de arriba.</Typography>
                {anteriores.map((regla) => <Stack key={regla.id} direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography sx={{ flex: 1 }}>{regla.nombreVisibleImpresora} — {regla.nombreEstacion}</Typography>
                    <Chip size="small" label={regla.habilitada ? 'No compatible' : 'Desactivado'} />
                    {regla.habilitada && <Button disabled={guardando} onClick={() => guardar(regla, regla, { habilitada: false })}>Desactivar</Button>}
                    {botonQuitar(regla)}
                </Stack>)}
            </Stack></CardContent></Card>}
        </>}
    </Stack>;
}
