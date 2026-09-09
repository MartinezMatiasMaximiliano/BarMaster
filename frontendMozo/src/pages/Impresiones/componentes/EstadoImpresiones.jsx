import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { cancelarTrabajoImpresion, obtenerTrabajosImpresion, obtenerPanelImpresion, reintentarTrabajoImpresion } from '../../../services/impresion/apiImpresion';
import { descargarDiagnosticoImpresion, limpiarDiagnosticoImpresion } from '../../../services/impresion/registroDiagnosticoImpresion';

const etiquetas = { Pendiente: 'Pendiente', ReintentoProgramado: 'Reintentando', Reservado: 'En proceso', Enviando: 'Enviando', AceptadoPorCola: 'Entregado al sistema', RequiereAtencion: 'Necesita revisión', Vencido: 'Vencido', Cancelado: 'Cancelado' };
export default function EstadoImpresiones({ integrada = false }) {
    const [panel, establecerPanel] = useState(null); const [trabajos, establecerTrabajos] = useState([]); const [error, establecerError] = useState(null);
    const cargar = async () => { const [datosPanel, listaTrabajos] = await Promise.all([obtenerPanelImpresion(), obtenerTrabajosImpresion({ limite: 100 })]); establecerPanel(datosPanel); establecerTrabajos(listaTrabajos); };
    useEffect(() => { cargar().catch((e) => establecerError(e.message)); const id = setInterval(() => cargar().catch(() => {}), 15000); return () => clearInterval(id); }, []);
    const ejecutarAccion = async (accion) => { try { await accion(); await cargar(); } catch (e) { establecerError(e.response?.data?.error?.mensaje || e.message); } };
    return <Stack spacing={3} sx={{ maxWidth: integrada ? 'none' : 1000, mx: integrada ? 0 : 'auto', pb: integrada ? 0 : 4 }}>{!integrada && <Typography variant="h4">Estado de impresiones</Typography>}{error && <Alert severity="error">{error}</Alert>}
        <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={descargarDiagnosticoImpresion}>Descargar diagnóstico</Button>
            <Button variant="text" onClick={limpiarDiagnosticoImpresion}>Limpiar diagnóstico</Button>
        </Stack>
        {panel && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>{[['Pendientes', panel.pendiente], ['Necesitan revisión', panel.requiereAtencion], ['Entregadas hoy', panel.aceptadosPorColaHoy], ['Equipos desconectados', panel.estacionesFueraDeLinea]].map(([nombre, valor]) => <Card key={nombre} variant="outlined" sx={{ flex: 1 }}><CardContent><Typography color="text.secondary">{nombre}</Typography><Typography variant="h4">{valor}</Typography></CardContent></Card>)}</Stack>}
        {trabajos.length === 0 && <Alert severity="info">Todavía no hay impresiones para mostrar.</Alert>}
        {trabajos.map((trabajo) => <Card key={trabajo.id} variant="outlined"><CardContent><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}><Stack><Typography fontWeight={700}>{trabajo.tipoDocumento === 'Comanda' ? 'Comanda' : 'Ticket'} · {trabajo.destino}</Typography><Typography variant="body2" color="text.secondary">Equipo: {trabajo.estacion} · {new Date(trabajo.creadoEn).toLocaleString('es-AR')} · ID {trabajo.id}</Typography>{trabajo.ultimoCodigoError && <Typography color="error" variant="body2">Referencia: {trabajo.ultimoCodigoError}</Typography>}</Stack><Stack direction="row" spacing={1} alignItems="center"><Chip label={etiquetas[trabajo.estado] || trabajo.estado} color={trabajo.estado === 'RequiereAtencion' ? 'warning' : trabajo.estado === 'AceptadoPorCola' ? 'success' : 'default'} />{trabajo.estado === 'RequiereAtencion' && <Button onClick={() => ejecutarAccion(() => reintentarTrabajoImpresion(trabajo.id, 'Reimpresión confirmada desde el panel'))}>Rehacer</Button>}{['Pendiente', 'ReintentoProgramado', 'RequiereAtencion'].includes(trabajo.estado) && <Button color="error" onClick={() => ejecutarAccion(() => cancelarTrabajoImpresion(trabajo.id, 'Cancelado desde el panel'))}>Cancelar</Button>}</Stack></Stack></CardContent></Card>)}
    </Stack>;
}
