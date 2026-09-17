import { useRef, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CloseIcon from '@mui/icons-material/Close';
import { CrearReserva } from '../../API/APIReservas';
import { claveDia } from '../../Helpers/fechasReservas';
import { agruparYOrdenarMesas, estadoMesa, estiloEstado } from './dominioDisponibilidad';
import { useDisponibilidadMesas } from './useDisponibilidadMesas';

export default function BuscadorDisponibilidad({ onReservaCreada }) {
    const [dia, setDia] = useState(() => claveDia(new Date()));
    const [hora, setHora] = useState('20:00');
    const { resultado, setResultado, cargando: buscando, error, setError, consultar, limpiar } = useDisponibilidadMesas();
    const [mesa, setMesa] = useState(null);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [personas, setPersonas] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [errorModal, setErrorModal] = useState('');
    const [exito, setExito] = useState('');
    const [orden, setOrden] = useState('disponibilidad');
    const [direccion, setDireccion] = useState('asc');
    const enviando = useRef(false);

    const cambiar = (setter, valor) => {
        setter(valor);
        setResultado(null);
        setError('');
        setExito('');
    };
    const buscar = async event => {
        event.preventDefault();
        setError('');
        setExito('');
        setResultado(null);
        const hoy = claveDia(new Date());
        if (dia < hoy) {
            setError('No se puede buscar disponibilidad de días anteriores.');
            return;
        }
        const fecha = new Date(`${dia}T${hora}`);
        if (!Number.isFinite(fecha.getTime())) {
            setError('Seleccioná una fecha y hora válidas.');
            return;
        }
        try {
            const fechaHora = fecha.toISOString();
            await consultar(fechaHora);
        } catch { /* el hook conserva el error visible */ }
    };
    const elegirMesa = seleccionada => {
        setMesa(seleccionada);
        setNombre('');
        setTelefono('');
        setPersonas('');
        setErrorModal('');
    };
    const limpiarBusqueda = () => {
        limpiar();
        setMesa(null);
        setError('');
        setErrorModal('');
        setExito('');
    };
    const confirmar = async event => {
        event.preventDefault();
        if (enviando.current) return;
        const cantidad = Number(personas);
        if (!nombre.trim() || !telefono.trim() || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > mesa.capacidad) {
            setErrorModal(`Completá nombre, teléfono y una cantidad entre 1 y ${mesa.capacidad} personas.`);
            return;
        }
        enviando.current = true;
        setGuardando(true);
        setErrorModal('');
        try {
            // Volver a consultar por si otro operario reservó mientras el modal estaba abierto.
            const disponibles = await consultar(resultado.fechaHora);
            const actual = disponibles.find(m => m.id === mesa.id);
            setResultado(prev => ({ ...prev, mesas: disponibles }));
            if (!actual) {
                setErrorModal('Esta mesa ya no está disponible. Cerrá el formulario y elegí otra.');
                return;
            }
            if (cantidad > actual.capacidad) {
                setMesa(actual);
                setErrorModal(`La capacidad actual de la mesa es de ${actual.capacidad} personas.`);
                return;
            }
            await CrearReserva({ idMesa: mesa.id, fechaHora: resultado.fechaHora,
                nombreReserva: nombre.trim(), telefono: telefono.trim(), cantidadDePersonas: cantidad,
                IdEstadoReserva: 2 });
            setResultado(prev => ({ ...prev, mesas: prev.mesas.filter(m => m.id !== mesa.id) }));
            setMesa(null);
            setExito('Reserva confirmada.');
            try {
                await onReservaCreada?.(resultado.fechaHora);
            } catch {
                setError('La reserva fue creada, pero no se pudo actualizar la agenda. Usá Actualizar para recargarla.');
            }
        } catch (e) {
            setErrorModal(e.message || 'No se pudo crear la reserva.');
        } finally {
            enviando.current = false;
            setGuardando(false);
        }
    };
    const esConsultaPasada = resultado && new Date(resultado.fechaHora).getTime() < Date.now();
    const mesasPorPlano = agruparYOrdenarMesas(resultado?.mesas, orden, direccion);
    return <Paper component="section" aria-label="Buscar disponibilidad" variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 0.5 }}>
            <Typography variant="h5" component="h2">Buscar disponibilidad</Typography>
            {resultado && <Tooltip title="Limpiar búsqueda" arrow>
                <IconButton size="small" aria-label="Limpiar búsqueda de disponibilidad" onClick={limpiarBusqueda}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Tooltip>}
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Elegí un día y una hora para ver las mesas libres. Las reservas canceladas no ocupan mesa.</Typography>
        <Stack component="form" onSubmit={buscar} direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }}>
            <TextField label="Día" type="date" value={dia} required disabled={buscando || guardando} inputProps={{ min: claveDia(new Date()) }}
                onChange={e => cambiar(setDia, e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Hora" type="time" value={hora} required disabled={buscando || guardando}
                onChange={e => cambiar(setHora, e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button type="submit" variant="contained" disabled={buscando || guardando}>{buscando ? 'Buscando…' : 'Buscar mesas'}</Button>
        </Stack>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {exito && <Alert severity="success" sx={{ mt: 2 }}>{exito}</Alert>}
        {resultado && <Box sx={{ mt: 2 }}>
            <Typography sx={{ mb: 1 }} role="status">{resultado.mesas.length ? `${resultado.mesas.length} mesas disponibles` : 'No hay mesas disponibles para ese día y hora.'}</Typography>
            {esConsultaPasada && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Consulta de una fecha pasada. Solo se pueden crear reservas para fechas y horas futuras.
            </Typography>}
            {resultado.mesas.length > 1 && <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mb: 1.5 }}>
                <TextField select size="small" label="Ordenar por" value={orden} onChange={e => setOrden(e.target.value)}
                    sx={{ minWidth: 190 }}>
                    <MenuItem value="disponibilidad">Disponibilidad</MenuItem>
                    <MenuItem value="personas">Cantidad de personas</MenuItem>
                </TextField>
                <Tooltip title={direccion === 'asc' ? 'Orden ascendente' : 'Orden descendente'} arrow>
                    <IconButton aria-label={direccion === 'asc' ? 'Dirección ascendente' : 'Dirección descendente'}
                        onClick={() => setDireccion(actual => actual === 'asc' ? 'desc' : 'asc')}
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, width: 40, height: 40, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        {direccion === 'asc' ? <ArrowDropUpIcon fontSize="large" /> : <ArrowDropDownIcon fontSize="large" />}
                    </IconButton>
                </Tooltip>
            </Stack>}
            <Box role="region" aria-label="Mesas disponibles" tabIndex={resultado.mesas.length ? 0 : undefined}
                sx={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: { xs: 'minmax(190px, 85%)', sm: 'minmax(220px, 1fr)' }, gap: 2,
                    alignItems: 'start', maxHeight: 360, overflowX: 'auto', overflowY: 'auto', pb: 1, p: 0.5 }}>
                {Object.entries(mesasPorPlano).map(([idPlano, grupo]) => <Paper key={idPlano} variant="outlined" sx={{ p: 1.5, minWidth: 0 }}>
                    <Typography component="h3" variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>{grupo.nombre}</Typography>
                    <Stack gap={1}>
                        {grupo.mesas.map(m => <Button key={m.id} variant="outlined" size="small" onClick={() => elegirMesa(m)}
                            disabled={esConsultaPasada || estadoMesa(m) === 'desconocida'} aria-label={`Mesa ${m.numero}, capacidad: ${m.capacidad} personas, disponibilidad ${estadoMesa(m)}`}
                            sx={{ px: 1.25, py: 0.75, minWidth: 0, width: '100%', justifyContent: 'space-between', textTransform: 'none',
                                borderRadius: 2, ...estiloEstado[estadoMesa(m)],
                                '&:hover': { filter: 'brightness(0.95)', ...estiloEstado[estadoMesa(m)] } }}>
                            <Typography component="span" fontWeight={700}>Mesa {m.numero}</Typography>
                            <Typography component="span" variant="caption" sx={{ whiteSpace: 'nowrap' }}>{m.capacidad} pers.</Typography>
                        </Button>)}
                    </Stack>
                </Paper>)}
            </Box>
            {resultado.mesas.length > 0 && <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }} aria-label="Referencia de disponibilidad">
                {[
                    ['Verde: 90 min o más', 'verde', 'La reserva activa más cercana está a 90 minutos o más, antes o después de la hora buscada, o la mesa no tiene otras reservas.'],
                    ['Amarilla: entre 30 y 90 min', 'amarilla', 'La reserva activa más cercana está a más de 30 y menos de 90 minutos, antes o después de la hora buscada.'],
                    ['Roja: hasta 30 min', 'roja', 'La mesa tiene una reserva activa hasta 30 minutos antes o después de la hora buscada. Conviene dejar margen entre ambas reservas.'],
                ].map(([etiqueta, estado, explicacion]) => <Tooltip key={estado} title={explicacion} arrow>
                    <Box component="span" tabIndex={0} sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'help',
                        minHeight: 32, px: 1.25, border: '1px solid', borderRadius: 2, fontSize: '0.8125rem', fontWeight: 700,
                        ...estiloEstado[estado] }}>
                        {etiqueta}
                    </Box>
                </Tooltip>)}
            </Stack>}
        </Box>}
        <Dialog open={Boolean(mesa)} onClose={() => { if (!guardando) setMesa(null); }} fullWidth maxWidth="sm" aria-labelledby="titulo-reservar-mesa">
            <Box component="form" onSubmit={confirmar}>
                <DialogTitle id="titulo-reservar-mesa">Reservar Mesa {mesa?.numero}</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>{resultado && new Date(resultado.fechaHora).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })} · Capacidad: {mesa?.capacidad} personas</Typography>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {errorModal && <Alert severity="error">{errorModal}</Alert>}
                        <TextField label="Nombre de reserva" autoFocus required value={nombre} onChange={e => setNombre(e.target.value)} disabled={guardando} />
                        <TextField label="Teléfono" type="tel" required value={telefono} onChange={e => setTelefono(e.target.value)} disabled={guardando} />
                        <TextField label="Cantidad de personas" type="number" required value={personas} onChange={e => setPersonas(e.target.value)}
                            inputProps={{ min: 1, max: mesa?.capacidad, step: 1 }} disabled={guardando} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button disabled={guardando} onClick={() => setMesa(null)}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={guardando}>{guardando ? 'Confirmando…' : 'Confirmar reserva'}</Button>
                </DialogActions>
            </Box>
        </Dialog>
    </Paper>;
}
