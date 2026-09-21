import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usarImpresion } from '../../../contexts/ContextoImpresion';
import { darAltaEstacionActual, obtenerImpresorasLocales, sincronizarInventarioImpresoras, actualizarImpresora, eliminarImpresora, solicitarPruebaRemotaImpresora } from '../../../services/impresion/apiImpresion';
import { obtenerVersionQz } from '../../../services/impresion/conexionQz';
import { imprimirCrudo } from '../../../services/impresion/impresionQz';
import { normalizarErrorQz } from '../../../services/impresion/erroresQz';
import { reiniciarTrabajadorImpresion } from '../../../services/impresion/trabajadorImpresion';
import { esImpresoraPermitida } from '../../../services/impresion/impresorasQz';
import { useGestionEstacion } from './useGestionEstacion';
import { useInventarioImpresoras } from './useInventarioImpresoras';

const normalizarNombreSistema = (nombre) => nombre.trim().toLocaleLowerCase();

function TarjetaEquipo({ nombre, nombreGuardado, editando, ocupado, alCambiar, alEditar, alCancelar, alGuardar }) {
    return <Card variant="outlined" sx={{ width: '100%', maxWidth: 520 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack data-enter-scope="true" direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                    <PrintOutlinedIcon color="primary" />
                    {editando
                        ? <TextField autoFocus size="small" label="Nombre de este equipo" value={nombre} onChange={(e) => alCambiar(e.target.value)} sx={{ minWidth: 240 }} />
                        : <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary">Este equipo</Typography>
                            <Typography fontWeight={700} noWrap>{nombreGuardado}</Typography>
                        </Box>}
                </Stack>
                {editando
                    ? <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" disabled={ocupado} onClick={alCancelar}>Cancelar</Button>
                        <Button data-enter-action="true" size="small" variant="contained" disabled={ocupado || nombre.trim().length < 2} onClick={alGuardar}>Guardar</Button>
                    </Stack>
                    : <Button size="small" startIcon={<EditOutlinedIcon />} disabled={ocupado} onClick={alEditar}>Editar nombre</Button>}
            </Stack>
        </CardContent>
    </Card>;
}

function TarjetaImpresora({ impresora, yaGuardada, bloqueadaPorCaja, ocupado, alCambiar, alGuardar, alProbar }) {
    const motivoBloqueo = yaGuardada
        ? 'Impresora ya guardada'
        : bloqueadaPorCaja ? 'No se puede guardar mientras haya una caja activa' : '';
    return <Card data-enter-scope="true" variant="outlined" sx={{ width: '100%', maxWidth: 360 }}><CardContent><Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
            <Typography fontWeight={700}>{impresora.nombreVisible}</Typography>
            <Chip size="small" color={impresora.presente ? 'success' : 'warning'} label={impresora.presente ? 'Disponible' : 'No detectada'} />
        </Stack>
        {yaGuardada && <Alert severity="info" variant="filled" sx={{ fontWeight: 700 }}>Impresora ya guardada</Alert>}
        <TextField disabled={yaGuardada || bloqueadaPorCaja} label="Nombre fácil de reconocer" value={impresora.nombreVisible} onChange={(e) => alCambiar({ nombreVisible: e.target.value })} />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button disabled={ocupado || !impresora.presente} onClick={alProbar}>Probar</Button>
            <Tooltip title={motivoBloqueo}>
                <span>
                    <Button data-enter-action="true" variant="contained" disabled={ocupado || yaGuardada || bloqueadaPorCaja || impresora.nombreVisible.trim().length < 2} onClick={alGuardar}>Guardar</Button>
                </span>
            </Tooltip>
        </Stack>
    </Stack></CardContent></Card>;
}

function GrillaImpresoras({ impresoras, nombresGuardados, bloqueadaPorCaja, ocupado, alCambiar, alGuardar, alProbar }) {
    return <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 360px))', gap: 2, justifyContent: 'start' }}>
        {impresoras.map((impresora) => <TarjetaImpresora
            key={impresora.id}
            impresora={impresora}
            yaGuardada={nombresGuardados.has(normalizarNombreSistema(impresora.nombreSistema))}
            bloqueadaPorCaja={bloqueadaPorCaja}
            ocupado={ocupado}
            alCambiar={(valores) => alCambiar(impresora.id, valores)}
            alGuardar={() => alGuardar(impresora)}
            alProbar={() => alProbar(impresora)}
        />)}
    </Box>;
}

function TablaImpresoras({ impresoras, bloqueadaPorCaja, ocupado, alEditar, alEliminar, alProbar }) {
    const [idEnEdicion, establecerIdEnEdicion] = useState(null);
    const [nombreEditado, establecerNombreEditado] = useState('');
    const comenzarEdicion = (impresora) => {
        establecerIdEnEdicion(impresora.id);
        establecerNombreEditado(impresora.nombreVisible);
    };
    const cancelarEdicion = () => {
        establecerIdEnEdicion(null);
        establecerNombreEditado('');
    };
    const confirmarEdicion = async (impresora) => {
        const actualizada = await alEditar(impresora, nombreEditado.trim());
        if (actualizada) cancelarEdicion();
    };

    return <TableContainer component={Card} variant="outlined">
        <Table size="small" sx={{ minWidth: 780 }}>
            <TableHead>
                <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Modelo</TableCell>
                    <TableCell>Conectada en</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Destinos asignados</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {impresoras.map((impresora) => <TableRow data-enter-scope="true" key={impresora.id} hover>
                    <TableCell sx={{ width: '32%', minWidth: 220 }}>
                        {idEnEdicion === impresora.id
                            ? <TextField fullWidth autoFocus size="small" label="Nombre" value={nombreEditado} onChange={(e) => establecerNombreEditado(e.target.value)} />
                            : <Typography fontWeight={600}>{impresora.nombreVisible}</Typography>}
                    </TableCell>
                    <TableCell sx={{ minWidth: 180 }}>{impresora.nombreSistema}</TableCell>
                    <TableCell sx={{ minWidth: 160 }}>{impresora.nombreEstacion}</TableCell>
                    <TableCell>
                        <Chip size="small" color={impresora.presente ? 'success' : 'warning'} label={impresora.presente ? 'Disponible' : 'No detectada'} />
                    </TableCell>
                    <TableCell align="center">{impresora.cantidadReglas ?? 0}</TableCell>
                    <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {idEnEdicion === impresora.id ? <>
                                <Button size="small" disabled={ocupado} onClick={cancelarEdicion}>Cancelar</Button>
                                <Button data-enter-action="true" size="small" variant="contained" disabled={ocupado || bloqueadaPorCaja || nombreEditado.trim().length < 2} onClick={() => confirmarEdicion(impresora)}>Confirmar</Button>
                            </> : <>
                                <Button size="small" disabled={ocupado || !impresora.presente} onClick={() => alProbar(impresora)}>Probar</Button>
                                <Tooltip title={bloqueadaPorCaja ? 'No se puede editar mientras haya una caja activa' : ''}><span><Button size="small" disabled={ocupado || bloqueadaPorCaja} onClick={() => comenzarEdicion(impresora)}>Editar</Button></span></Tooltip>
                                <Tooltip title={bloqueadaPorCaja ? 'No se puede eliminar mientras haya una caja activa' : ''}><span><Button size="small" color="error" disabled={ocupado || bloqueadaPorCaja} onClick={() => alEliminar(impresora)}>Eliminar</Button></span></Tooltip>
                            </>}
                        </Stack>
                    </TableCell>
                </TableRow>)}
            </TableBody>
        </Table>
    </TableContainer>;
}

export default function EncontrarImpresoras({ integrada = false, encabezado = null, encabezadoPagina = null, bloqueadaPorCaja = false, onImpresorasActualizadas }) {
    const impresion = usarImpresion();
    const { nombre: nombreEstacion, setNombre: establecerNombreEstacion, nombreGuardado: nombreEstacionGuardado,
        errorCarga: errorEstacionCarga, cargar: cargarEstacion, guardar: persistirEstacion } = useGestionEstacion();
    const [editandoNombreEstacion, establecerEditandoNombreEstacion] = useState(false);
    const { locales: impresoras, setLocales: establecerImpresoras, registradas: impresorasRegistradas,
        setRegistradas: establecerImpresorasRegistradas, cargando: cargandoRegistradas,
        error: errorRegistradas, cargarRegistradas } = useInventarioImpresoras(onImpresorasActualizadas);
    const [nombresNuevos, establecerNombresNuevos] = useState(new Set());
    const [nombresGuardadosEncontrados, establecerNombresGuardadosEncontrados] = useState(new Set());
    const [ocupado, establecerOcupado] = useState(false);
    const [aviso, establecerAviso] = useState(null);
    const [avisoEstacion, establecerAvisoEstacion] = useState(null);

    const ejecutar = async (trabajo, mensaje) => {
        establecerOcupado(true); establecerAviso(null);
        try {
            const valor = await trabajo();
            if (mensaje) establecerAviso({ severity: 'success', message: mensaje });
            return valor;
        }
        catch (error) { establecerAviso({ severity: 'error', message: normalizarErrorQz(error).mensaje }); return null; }
        finally { establecerOcupado(false); }
    };
    const detectar = () => ejecutar(async () => {
        establecerNombresNuevos(new Set());
        establecerNombresGuardadosEncontrados(new Set());
        await darAltaEstacionActual(nombreEstacionGuardado);
        const registradasAntes = (await obtenerImpresorasLocales())
            .filter((x) => esImpresoraPermitida(x.nombreSistema));
        const nombresRegistrados = new Set(registradasAntes.map((x) => normalizarNombreSistema(x.nombreSistema)));
        await impresion.conectar();
        const nombres = await impresion.actualizarImpresoras();
        const nombresDetectados = nombres.map(normalizarNombreSistema);
        establecerNombresNuevos(new Set(
            nombresDetectados
                .filter((nombre) => !nombresRegistrados.has(nombre)),
        ));
        establecerNombresGuardadosEncontrados(new Set(
            nombresDetectados.filter((nombre) => nombresRegistrados.has(nombre)),
        ));
        const sincronizadas = await sincronizarInventarioImpresoras(nombres, await obtenerVersionQz(), undefined, true);
        establecerImpresoras(sincronizadas.filter((x) => esImpresoraPermitida(x.nombreSistema)));
        await cargarRegistradas();
        reiniciarTrabajadorImpresion();
    });
    const guardarNombreEstacion = async () => {
        establecerOcupado(true);
        establecerAvisoEstacion(null);
        try {
            const estacion = await persistirEstacion();
            establecerNombreEstacion(estacion.nombre);
            establecerEditandoNombreEstacion(false);
            await cargarRegistradas();
            establecerAvisoEstacion({ severity: 'success', message: 'Nombre del equipo actualizado.' });
            return estacion;
        } catch (error) {
            establecerAvisoEstacion({ severity: 'error', message: normalizarErrorQz(error).mensaje });
            return null;
        } finally {
            establecerOcupado(false);
        }
    };
    const cancelarEdicionNombreEstacion = () => {
        establecerNombreEstacion(nombreEstacionGuardado);
        establecerEditandoNombreEstacion(false);
    };
    const cambiar = (id, valores) => establecerImpresoras((elementos) => elementos.map((x) => x.id === id ? { ...x, ...valores } : x));
    const guardar = (impresora) => ejecutar(async () => {
        const actualizada = await actualizarImpresora(impresora.id, {
            nombreVisible: impresora.nombreVisible, anchoPapelMm: impresora.anchoPapelMm || 58,
            codificacion: impresora.codificacion || 'CP858', habilitada: impresora.eliminadaEn ? true : impresora.habilitada,
            restaurar: Boolean(impresora.eliminadaEn),
        });
        cambiar(impresora.id, actualizada);
        if (impresoras.some((local) => local.id === impresora.id)) {
            establecerNombresNuevos((nombres) => {
                const siguientes = new Set(nombres);
                siguientes.delete(normalizarNombreSistema(actualizada.nombreSistema));
                return siguientes;
            });
            establecerNombresGuardadosEncontrados((nombres) => new Set(nombres).add(normalizarNombreSistema(actualizada.nombreSistema)));
        }
        await cargarRegistradas();
        return actualizada;
    }, 'Impresora guardada.');
    const editarNombre = (impresora, nombreVisible) => guardar({ ...impresora, nombreVisible });
    const eliminar = async (impresora) => {
        if (!window.confirm(`¿Eliminar la impresora "${impresora.nombreVisible}"?`)) return null;
        return ejecutar(async () => {
            await eliminarImpresora(impresora.id);
            establecerImpresorasRegistradas((elementos) => elementos.filter((x) => x.id !== impresora.id));
            establecerImpresoras((elementos) => elementos.filter((x) => x.id !== impresora.id));
            if (impresoras.some((local) => local.id === impresora.id)) {
                establecerNombresNuevos((nombres) => {
                    const siguientes = new Set(nombres);
                    siguientes.delete(normalizarNombreSistema(impresora.nombreSistema));
                    return siguientes;
                });
                establecerNombresGuardadosEncontrados((nombres) => {
                    const siguientes = new Set(nombres);
                    siguientes.delete(normalizarNombreSistema(impresora.nombreSistema));
                    return siguientes;
                });
            }
            await cargarRegistradas();
            return true;
        }, 'Impresora eliminada.');
    };
    const probar = (impresora) => ejecutar(async () => {
        const opciones = { nombreTrabajo: 'BarMaster - Prueba', codificacion: impresora.codificacion || 'CP858' };
        await imprimirCrudo(impresora.nombreSistema, '\x1B@\x1Ba\x01BarMaster\nPrueba correcta\n\n\n\x1DV\x00', opciones);
    }, 'Prueba enviada. Revisá que haya salido correctamente.');
    const probarRegistrada = (impresora) => ejecutar(
        () => solicitarPruebaRemotaImpresora(impresora.id),
        `Prueba enviada al equipo ${impresora.nombreEstacion}.`,
    );
    const fueEncontrada = (impresora) => {
        const nombre = normalizarNombreSistema(impresora.nombreSistema);
        return nombresNuevos.has(nombre) || nombresGuardadosEncontrados.has(nombre);
    };
    const impresorasEncontradas = impresoras.filter(fueEncontrada);
    const botonBuscar = <Button
        variant="contained"
        startIcon={ocupado ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
        disabled={ocupado || editandoNombreEstacion}
        onClick={detectar}
        sx={{ flexShrink: 0 }}
    >Buscar</Button>;

    return <Stack spacing={3} sx={{ maxWidth: integrada ? 'none' : 900, mx: integrada ? 0 : 'auto', pb: integrada ? 0 : 4 }}>
        {avisoEstacion && <Alert severity={avisoEstacion.severity} onClose={() => establecerAvisoEstacion(null)} sx={{ maxWidth: 520 }}>{avisoEstacion.message}</Alert>}
        {errorEstacionCarga && <Alert severity="error" action={<Button color="inherit" onClick={cargarEstacion}>Reintentar</Button>}>
            No se pudo cargar la estación: {errorEstacionCarga}
        </Alert>}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
            {encabezadoPagina || (!integrada && <Box><Typography variant="h4">Impresoras</Typography><Typography color="text.secondary">Buscá las impresoras instaladas, asignales un nombre claro y hacé una prueba.</Typography></Box>)}
            <TarjetaEquipo
                nombre={nombreEstacion}
                nombreGuardado={nombreEstacionGuardado}
                editando={editandoNombreEstacion}
                ocupado={ocupado}
                alCambiar={establecerNombreEstacion}
                alEditar={() => {
                    establecerAvisoEstacion(null);
                    establecerEditandoNombreEstacion(true);
                }}
                alCancelar={cancelarEdicionNombreEstacion}
                alGuardar={guardarNombreEstacion}
            />
        </Stack>
        {encabezado
            ? <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
                {encabezado}
                {botonBuscar}
            </Stack>
            : botonBuscar}
        {aviso && <Alert severity={aviso.severity} onClose={() => establecerAviso(null)}>{aviso.message}</Alert>}
        {impresoras.length === 0 && <Alert severity="info">Todavía no hay impresoras detectadas en este equipo.</Alert>}
        {impresorasEncontradas.length > 0 && <Stack spacing={1.5}>
            <GrillaImpresoras impresoras={impresorasEncontradas} nombresGuardados={nombresGuardadosEncontrados} bloqueadaPorCaja={bloqueadaPorCaja} ocupado={ocupado} alCambiar={cambiar} alGuardar={guardar} alProbar={probar} />
        </Stack>}
        <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Impresoras guardadas</Typography>
                <Button onClick={cargarRegistradas} disabled={ocupado || cargandoRegistradas} startIcon={<RefreshIcon />}>Actualizar</Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">Todas las impresoras registradas en esta sucursal, de todos los equipos.</Typography>
            {cargandoRegistradas && <Typography role="status">Cargando impresoras guardadas…</Typography>}
            {errorRegistradas && <Alert severity="error">No se pudieron cargar las impresoras guardadas: {errorRegistradas}</Alert>}
            {!cargandoRegistradas && !errorRegistradas && impresorasRegistradas.length === 0 && <Alert severity="info">No hay impresoras guardadas en esta sucursal.</Alert>}
            {impresorasRegistradas.length > 0 && <TablaImpresoras impresoras={impresorasRegistradas} bloqueadaPorCaja={bloqueadaPorCaja} ocupado={ocupado || cargandoRegistradas} alEditar={editarNombre} alEliminar={eliminar} alProbar={probarRegistrada} />}
        </Stack>
    </Stack>;
}
