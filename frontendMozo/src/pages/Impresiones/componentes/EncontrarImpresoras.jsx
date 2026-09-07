import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Switch, TextField, Typography } from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usarImpresion } from '../../../contexts/ContextoImpresion';
import { darAltaEstacionActual, obtenerImpresorasLocales, sincronizarInventarioImpresoras, actualizarImpresora } from '../../../services/impresion/apiImpresion';
import { obtenerVersionQz } from '../../../services/impresion/conexionQz';
import { imprimirCrudo } from '../../../services/impresion/impresionQz';
import { normalizarErrorQz } from '../../../services/impresion/erroresQz';
import { reiniciarTrabajadorImpresion } from '../../../services/impresion/trabajadorImpresion';

function TarjetaImpresora({ impresora, ocupado, alCambiar, alGuardar, alProbar }) {
    return <Card variant="outlined"><CardContent><Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
            <Box><Typography fontWeight={700}>{impresora.nombreVisible}</Typography><Typography variant="body2" color="text.secondary">Detectada como: {impresora.nombreSistema}</Typography></Box>
            <Chip size="small" color={impresora.presente ? 'success' : 'warning'} label={impresora.presente ? 'Disponible' : 'No detectada'} />
        </Stack>
        <TextField label="Nombre fácil de reconocer" value={impresora.nombreVisible} onChange={(e) => alCambiar({ nombreVisible: e.target.value })} />
        <Typography variant="body2" color="text.secondary">Configurada automáticamente para imprimir tickets.</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center"><Switch checked={impresora.habilitada} onChange={(e) => alCambiar({ habilitada: e.target.checked })} /><Typography>Habilitada</Typography></Stack>
            <Stack direction="row" spacing={1}><Button disabled={ocupado || !impresora.presente} onClick={alProbar}>Probar</Button><Button variant="contained" disabled={ocupado || impresora.nombreVisible.trim().length < 2} onClick={alGuardar}>Guardar</Button></Stack>
        </Stack>
    </Stack></CardContent></Card>;
}

export default function EncontrarImpresoras({ integrada = false }) {
    const impresion = usarImpresion();
    const [nombreEstacion, establecerNombreEstacion] = useState('Caja principal');
    const [impresoras, establecerImpresoras] = useState([]);
    const [ocupado, establecerOcupado] = useState(false);
    const [aviso, establecerAviso] = useState(null);
    useEffect(() => { obtenerImpresorasLocales().then(establecerImpresoras).catch(() => {}); }, []);

    const ejecutar = async (trabajo, mensaje) => {
        establecerOcupado(true); establecerAviso(null);
        try { const valor = await trabajo(); establecerAviso({ severity: 'success', message: mensaje }); return valor; }
        catch (error) { establecerAviso({ severity: 'error', message: normalizarErrorQz(error).mensaje }); return null; }
        finally { establecerOcupado(false); }
    };
    const detectar = () => ejecutar(async () => {
        await darAltaEstacionActual(nombreEstacion.trim()); await impresion.conectar();
        const nombres = await impresion.actualizarImpresoras();
        establecerImpresoras(await sincronizarInventarioImpresoras(nombres, await obtenerVersionQz())); reiniciarTrabajadorImpresion();
    }, 'Búsqueda terminada. Ya podés identificar y probar cada impresora.');
    const cambiar = (id, valores) => establecerImpresoras((elementos) => elementos.map((x) => x.id === id ? { ...x, ...valores } : x));
    const guardar = (impresora) => ejecutar(async () => cambiar(impresora.id, await actualizarImpresora(impresora.id, {
        nombreVisible: impresora.nombreVisible, anchoPapelMm: impresora.anchoPapelMm || 58,
        codificacion: impresora.codificacion || 'CP858', habilitada: impresora.habilitada,
    })), 'Impresora guardada.');
    const probar = (impresora) => ejecutar(async () => {
        const opciones = { nombreTrabajo: 'BarMaster - Prueba', codificacion: impresora.codificacion || 'CP858' };
        await imprimirCrudo(impresora.nombreSistema, '\x1B@\x1Ba\x01BarMaster\nPrueba correcta\n\n\n\x1DV\x00', opciones);
    }, 'Prueba enviada. Revisá que haya salido correctamente.');

    return <Stack spacing={3} sx={{ maxWidth: integrada ? 'none' : 900, mx: integrada ? 0 : 'auto', pb: integrada ? 0 : 4 }}>
        {!integrada && <Box><Typography variant="h4">Impresoras</Typography><Typography color="text.secondary">Buscá las impresoras instaladas, asignales un nombre claro y hacé una prueba.</Typography></Box>}
        {aviso && <Alert severity={aviso.severity} onClose={() => establecerAviso(null)}>{aviso.message}</Alert>}
        <Card variant="outlined"><CardContent><Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center"><PrintOutlinedIcon color="primary" /><Typography fontWeight={700}>Este equipo</Typography></Stack>
            <TextField label="Nombre de este equipo" value={nombreEstacion} onChange={(e) => establecerNombreEstacion(e.target.value)} helperText="Por ejemplo: Caja principal, Cocina o Barra" />
            <Button variant="contained" startIcon={ocupado ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} disabled={ocupado || nombreEstacion.trim().length < 2} onClick={detectar}>Buscar impresoras instaladas</Button>
        </Stack></CardContent></Card>
        {impresoras.length === 0 ? <Alert severity="info">Todavía no hay impresoras detectadas en este equipo.</Alert> : impresoras.map((impresora) => <TarjetaImpresora key={impresora.id} impresora={impresora} ocupado={ocupado} alCambiar={(valores) => cambiar(impresora.id, valores)} alGuardar={() => guardar(impresora)} alProbar={() => probar(impresora)} />)}
    </Stack>;
}
