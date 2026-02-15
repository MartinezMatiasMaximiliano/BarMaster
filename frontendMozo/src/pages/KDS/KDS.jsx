import { useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Switch,
    FormControlLabel,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    IconButton,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import KitchenIcon from '@mui/icons-material/Kitchen';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SortIcon from '@mui/icons-material/Sort';
import { useKDS } from './hooks/useKDS';
import PedidoCard from './components/PedidoCard';
import EstadisticasKDS from './components/EstadisticasKDS';
import useSignalR from '../../hooks/useSignalR';
import { SnackbarWrapper } from '../../components/common/SnackbarWrapper';

/**
 * Página principal del KDS (Kitchen Display System)
 * Muestra pedidos en tiempo real para la cocina
 */
function KDS() {
    const {
        itemsFiltrados,
        estadisticas,
        filtroEstado,
        ordenamiento,
        sonidoHabilitado,
        notificacion,
        snackbar,
        setFiltroEstado,
        setOrdenamiento,
        setSonidoHabilitado,
        setNotificacion,
        marcarEnPreparacion,
        marcarListo,
        revertirAccion,
        calcularTiempoTranscurrido,
        closeSnackbar
    } = useKDS();

    // Integrar SignalR para actualización en tiempo real
    useSignalR({
        onRegistrarProducto: () => {
            // Cuando se registra un nuevo producto, el estado de Redux se actualiza automáticamente
            // No necesitamos hacer nada aquí, solo escuchar el evento
        }
    });

    // Auto-refresh cada 5 segundos como respaldo
    useEffect(() => {
        const interval = setInterval(() => {
            // El estado de Redux se actualiza automáticamente vía SignalR
            // Este intervalo es solo un respaldo
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleFiltroChange = (event, newFiltros) => {
        if (newFiltros === null || newFiltros.length === 0) {
            // Si no hay filtros seleccionados, mantener "Todos"
            setFiltroEstado(['todos']);
            return;
        }

        // Si el nuevo array incluye "Todos"
        if (newFiltros.includes('todos')) {
            // Si solo está "Todos", mantenerlo
            if (newFiltros.length === 1) {
                setFiltroEstado(['todos']);
                return;
            }
            // Si "Todos" está junto con otros filtros, remover "Todos"
            const filtrosSinTodos = newFiltros.filter(f => f !== 'todos');
            setFiltroEstado(filtrosSinTodos);
            return;
        }

        // Si el nuevo array NO incluye "Todos", usar los filtros seleccionados
        setFiltroEstado(newFiltros);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <KitchenIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1" fontWeight={700}>
                        Vista de Cocina (KDS)
                    </Typography>
                </Stack>

                {/* Controles */}
                <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
                    <ToggleButtonGroup
                        value={filtroEstado}
                        onChange={handleFiltroChange}
                        size="small"
                        sx={{ mb: { xs: 2, sm: 0 } }}
                    >
                        <ToggleButton value="todos">Todos</ToggleButton>
                        <ToggleButton value="pendiente">Pendientes</ToggleButton>
                        <ToggleButton value="en_preparacion">En Preparación</ToggleButton>
                        <ToggleButton value="listo">Listos</ToggleButton>
                    </ToggleButtonGroup>

                    <FormControl size="small" sx={{ minWidth: 200, mb: { xs: 2, sm: 0 } }}>
                        <InputLabel id="ordenamiento-label">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <SortIcon fontSize="small" />
                                <span>Ordenar por</span>
                            </Stack>
                        </InputLabel>
                        <Select
                            labelId="ordenamiento-label"
                            value={ordenamiento}
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <SortIcon fontSize="small" />
                                    <span>Ordenar por</span>
                                </Stack>
                            }
                            onChange={(e) => setOrdenamiento(e.target.value)}
                        >
                            <MenuItem value="mas_antiguo">Más antiguo</MenuItem>
                            <MenuItem value="mas_nuevo">Más nuevo</MenuItem>
                            <MenuItem value="por_mesas">Por mesas</MenuItem>
                            <MenuItem value="por_estado">Por estado</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={sonidoHabilitado}
                                onChange={(e) => setSonidoHabilitado(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                {sonidoHabilitado ? <VolumeUpIcon /> : <VolumeOffIcon />}
                                <Typography variant="body2">Sonido</Typography>
                            </Stack>
                        }
                    />
                </Stack>
            </Box>

            {/* Estadísticas */}
            <EstadisticasKDS estadisticas={estadisticas} />

            {/* Lista de pedidos */}
            {itemsFiltrados.length === 0 ? (
                <Alert severity="info" sx={{ mt: 3 }}>
                    No hay pedidos para mostrar con el filtro seleccionado.
                </Alert>
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        justifyContent: 'flex-start'
                    }}
                >
                    {itemsFiltrados.map((item) => (
                        <PedidoCard
                            key={item.id}
                            item={item}
                            onMarcarEnPreparacion={marcarEnPreparacion}
                            onMarcarListo={marcarListo}
                            calcularTiempoTranscurrido={calcularTiempoTranscurrido}
                        />
                    ))}
                </Box>
            )}

            {/* Información adicional */}
            <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    <strong>Nota:</strong> Puedes ordenar los pedidos usando el selector "Ordenar por".
                </Typography>
            </Box>

            {/* Snackbar para notificaciones de acciones reversibles */}
            <Snackbar
                open={notificacion !== null}
                autoHideDuration={10000}
                onClose={() => setNotificacion(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ mb: 8, zIndex: 1500 }}
            >
                <Alert
                    severity={notificacion?.estadoNuevo === 'En Preparación' ? 'info' : 'success'}
                    sx={{ 
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        '& .MuiAlert-message': {
                            flex: 1
                        }
                    }}
                    action={
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button
                                color="inherit"
                                size="small"
                                startIcon={<UndoIcon />}
                                onClick={() => revertirAccion(notificacion)}
                                sx={{ textTransform: 'none' }}
                            >
                                Revertir
                            </Button>
                            <IconButton
                                size="small"
                                aria-label="close"
                                color="inherit"
                                onClick={() => setNotificacion(null)}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    }
                >
                    <Typography variant="body2">
                        {notificacion?.mensaje || ''}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
                        Puedes revertir esta acción
                    </Typography>
                </Alert>
            </Snackbar>

            {/* Snackbar para errores */}
            <SnackbarWrapper
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
                sx={{ mb: notificacion !== null ? 18 : 8 }}
            />
        </Container>
    );
}

export default KDS;

