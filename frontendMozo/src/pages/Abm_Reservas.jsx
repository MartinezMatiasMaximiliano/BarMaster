import { useMemo, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { CrearReserva, ModificarReserva, BorrarReserva } from '../API/APIReservas';
import Tabla from '../components/Tabla/Tabla';
import Fila_Acciones from '../components/Tabla/Fila_Acciones';
import Modal_Agregar from '../components/Modals/Agregar_ABM/Modal_Agregar';
import { camposConMesas } from '../configs/agregar/Reservas';
import { claveDia } from '../Helpers/fechasReservas';
import BuscadorDisponibilidad from '../components/Reservas/BuscadorDisponibilidad';
import EstadoReservaChip from '../components/Reservas/EstadoReservaChip';
const hora = fecha => new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
const api = { crear: CrearReserva, modificar: ModificarReserva, eliminar: BorrarReserva };

export default function Abm_Reservas({ datos_reservas = [], mesas = [], recargarComponentes, titulo = 'Reservas' }) {
    const [dia, setDia] = useState(() => claveDia(new Date()));
    const [mes, setMes] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [errorEstado, setErrorEstado] = useState('');
    const campos = useMemo(() => camposConMesas(mesas), [mesas]);
    const reservasDia = useMemo(() => datos_reservas.filter(r => claveDia(r.fechaHora) === dia)
        .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)), [datos_reservas, dia]);
    const conteos = useMemo(() => datos_reservas.reduce((resultado, reserva) => {
        if (Number(reserva.IdEstadoReserva) !== 3) {
            const clave = claveDia(reserva.fechaHora);
            resultado[clave] = (resultado[clave] || 0) + 1;
        }
        return resultado;
    }, {}), [datos_reservas]);
    const columnas = [
        { key: 'fechaHora', label: 'Hora', render: fila => hora(fila.fechaHora) },
        { key: 'nombreReserva', label: 'Reserva' },
        { key: 'mesaReserva', label: 'Mesa', render: fila => fila.mesaReserva || '' },
        { key: 'cantidadDePersonas', label: 'Personas' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'estado', label: 'Estado', render: fila => <EstadoReservaChip estado={fila.estado}
            idEstado={fila.IdEstadoReserva} onError={setErrorEstado} onCambiar={async idEstado => {
                setErrorEstado('');
                await ModificarReserva({ id: fila.id, IdEstadoReserva: idEstado });
                await recargarComponentes();
            }} /> },
        { key: '__acciones', label: 'Acciones', render: fila => <Fila_Acciones fila={fila} api={api}
            recargar={recargarComponentes} showEditar showToggle={() => false} campos={campos} /> },
    ];
    const inicio = (mes.getDay() + 6) % 7;
    const diasEnMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const elegirHoy = () => {
        const hoy = new Date();
        setDia(claveDia(hoy));
        setMes(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    };
    return <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>{titulo}</Typography>
        <BuscadorDisponibilidad onReservaCreada={async fechaHora => {
            const fecha = new Date(fechaHora);
            setDia(claveDia(fecha));
            setMes(new Date(fecha.getFullYear(), fecha.getMonth(), 1));
            return await recargarComponentes();
        }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
            <Paper component="section" aria-label="Calendario de reservas" variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Button aria-label="Mes anterior" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>‹</Button>
                    <Typography component="h2" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>{mes.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</Typography>
                    <Button aria-label="Mes siguiente" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>›</Button>
                </Stack>
                <Button onClick={elegirHoy} size="small" sx={{ mb: 1 }}>Hoy</Button>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.5 }}>
                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(d => <Typography key={d} align="center" variant="caption">{d}</Typography>)}
                    {Array.from({ length: inicio }, (_, i) => <span key={`vacio-${i}`} />)}
                    {Array.from({ length: diasEnMes }, (_, i) => {
                        const fecha = claveDia(new Date(mes.getFullYear(), mes.getMonth(), i + 1));
                        return <Button key={fecha} aria-label={`${fecha}, ${conteos[fecha] || 0} reservas`}
                            aria-pressed={fecha === dia} aria-current={fecha === claveDia(new Date()) ? 'date' : undefined}
                            variant={fecha === dia ? 'contained' : 'text'} onClick={() => setDia(fecha)}
                            sx={{ minWidth: 0, minHeight: 50, display: 'flex', flexDirection: 'column', p: 0.5 }}>
                            {i + 1}<Typography component="span" variant="caption" sx={{ lineHeight: 1, minHeight: 12 }}>{conteos[fecha] ? `• ${conteos[fecha]}` : ''}</Typography>
                        </Button>;
                    })}
                </Box>
                <Typography variant="caption" color="text.secondary">El indicador cuenta reservas no canceladas.</Typography>
            </Paper>
            <Box component="section" aria-label="Agenda del día" sx={{ minWidth: 0 }}>
                {errorEstado && <Alert severity="error" onClose={() => setErrorEstado('')} sx={{ mb: 2 }}>{errorEstado}</Alert>}
                <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h5" component="h2">{new Date(`${dia}T12:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Typography>
                    <Button onClick={recargarComponentes}>Actualizar</Button>
                    <Modal_Agregar key={dia} nombre="reserva" campos={campos} agregar={api.crear}
                        initialValues={{ IdEstadoReserva: 2, fechaHora: new Date(`${dia}T20:00:00`).toISOString() }} recargarComponentes={recargarComponentes} />
                </Stack>
                <Typography color="text.secondary" sx={{ mb: 2 }}>{reservasDia.length} reservas</Typography>
                {reservasDia.length === 0 && <Typography role="status" sx={{ mb: 2 }}>No hay reservas para este día.</Typography>}
                {reservasDia.length > 0 && <Tabla filas={reservasDia} columnas={columnas} titulo="Reservas del día"
                    paginacion={false} minHeightContenido="auto" ajustarAlturaAlContenido mostrarExportacion={false} />}
            </Box>
        </Box>
    </Box>;
}
