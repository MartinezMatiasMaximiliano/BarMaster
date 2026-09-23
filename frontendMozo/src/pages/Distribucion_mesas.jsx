import React, { useState, useEffect, useMemo, useRef } from "react";
import { Container, Box, FormControl, InputLabel, Select, MenuItem, Typography, Alert, Stack } from "@mui/material";
import GridLayout, { WidthProvider } from "react-grid-layout";
import SaveIcon from "@mui/icons-material/Save";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { ModificarMesa } from "../API/APIMesas";
import { LoadingButton } from "../components/common/LoadingButton";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import { CrearPlano, ModificarPlano, BorrarPlano } from "../API/APIPlanos";
import { Campos as Campos_Agregar } from "../configs/agregar/Planos";
import { Campos as Campos_Editar } from "../configs/modificar/Planos";
import { boxCardBorder } from '../styles/boxStyles';

const ResponsiveGridLayout = WidthProvider(GridLayout);

function ContenidoMesaDistribucion({ nombre, icono }) {
    const contenidoRef = useRef(null);
    const [medidas, setMedidas] = useState({ width: 60, height: 50 });

    useEffect(() => {
        const elemento = contenidoRef.current;
        if (!elemento || typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setMedidas(actuales => (
                actuales.width === width && actuales.height === height
                    ? actuales
                    : { width, height }
            ));
        });
        observer.observe(elemento);
        return () => observer.disconnect();
    }, []);

    const tamanoIcono = Math.max(8, Math.min(42, medidas.width * 0.35, medidas.height * 0.42));
    const tamanoTexto = Math.max(6, Math.min(14, medidas.width / 6, medidas.height / 3.4));

    return (
        <Box
            ref={contenidoRef}
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${Math.min(4, medidas.height * 0.06)}px`,
                overflow: 'hidden',
            }}
        >
            <img
                src={icono}
                alt=""
                aria-hidden="true"
                style={{ width: tamanoIcono, height: tamanoIcono, objectFit: 'contain', flexShrink: 1 }}
            />
            <Typography
                component="span"
                sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.1, fontSize: tamanoTexto, whiteSpace: 'nowrap' }}
            >
                {nombre}
            </Typography>
        </Box>
    );
}

function Distribucion_mesas({ planos: planosOrigen = [], recargarPlanos }) {
    const planos = useMemo(() => (planosOrigen || []).map(plano => ({
        id: plano.id ?? plano.Id,
        nombre: plano.nombre ?? plano.Nombre,
        detalles: plano.detalles ?? plano.Detalles,
        mesas: plano.mesas ?? plano.Mesas ?? [],
    })), [planosOrigen]);
    const [planoSeleccionado, setPlanoSeleccionado] = useState('');
    const [mesas, setMesas] = useState([]);
    const [layout, setLayout] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const planoSeleccionadoObj = planos.find(plano => plano.id === planoSeleccionado || String(plano.id) === String(planoSeleccionado));
    const apiPlanos = useMemo(() => ({ crear: CrearPlano, modificar: ModificarPlano, eliminar: BorrarPlano }), []);

    useEffect(() => {
        if (planoSeleccionado && !planos.some(plano => String(plano.id) === String(planoSeleccionado))) {
            setPlanoSeleccionado('');
        }
    }, [planos, planoSeleccionado]);

    // Cuando se selecciona un plano, cargar sus mesas y crear el layout
    useEffect(() => {
        if (planoSeleccionado && planos.length > 0) {
            const plano = planos.find(p => String(p.id) === String(planoSeleccionado));
            if (plano && plano.mesas && Array.isArray(plano.mesas) && plano.mesas.length > 0) {
                setMesas(plano.mesas);
                // Crear layout desde las mesas con sus coordenadas x, y, w, h
                // Normalizar las propiedades de las mesas (pueden venir con mayúsculas)
                const nuevoLayout = plano.mesas.map(mesa => ({
                    i: mesa.id || mesa.Id,
                    x: mesa.x || 0,
                    y: mesa.y || 0,
                    w: mesa.w || 1,
                    h: mesa.h || 1,
                    minW: 1,
                    minH: 1
                }));
                setLayout(nuevoLayout);
            } else {
                setMesas([]);
                setLayout([]);
            }
        } else {
            setMesas([]);
            setLayout([]);
        }
    }, [planoSeleccionado, planos]);

    // Manejar cambios en el layout (cuando se arrastra o redimensiona una mesa)
    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
    };

    // Guardar las coordenadas de las mesas
    const handleGuardar = async () => {
        if (!planoSeleccionado || layout.length === 0) {
            setMensaje({ tipo: 'warning', texto: 'No hay mesas para guardar' });
            return;
        }

        setGuardando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            // Actualizar cada mesa con sus nuevas coordenadas
            const promesas = layout.map(item => {
                const mesa = mesas.find(m => (m.id === item.i || m.Id === item.i));
                if (mesa) {
                    return ModificarMesa({
                        id: item.i,
                        x: item.x,
                        y: item.y,
                        w: item.w,
                        h: item.h
                    });
                }
                return Promise.resolve();
            });

            const resultados = await Promise.all(promesas);
            
            // Verificar si hubo errores
            const errores = resultados.filter(r => r && r.status && r.status >= 400);
            if (errores.length > 0) {
                setMensaje({ tipo: 'error', texto: `Error al guardar ${errores.length} mesa(s)` });
            } else {
                setMensaje({ tipo: 'success', texto: 'Coordenadas guardadas correctamente' });
                
                // Limpiar mensaje después de 3 segundos
                setTimeout(() => {
                    setMensaje({ tipo: '', texto: '' });
                }, 3000);
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al guardar las coordenadas: ' + (error.message || 'Error desconocido') });
        } finally {
            setGuardando(false);
        }
    };

    // Obtener el nombre de la mesa por su ID
    const obtenerNombreMesa = (mesaId) => {
        const mesa = mesas.find(m => (m.id === mesaId || m.Id === mesaId));
        return mesa ? `Mesa ${mesa.numero ?? mesa.Numero}` : `Mesa ${mesaId}`;
    };

    const obtenerIconoMesa = (mesaId) => {
        const mesa = mesas.find(m => (m.id === mesaId || m.Id === mesaId));
        const visita = mesa?.visita ?? mesa?.Visita;
        return visita?.mozo ?? visita?.Mozo
            ? '/iconos/mesa_ocupada_blanca.png'
            : '/iconos/mesa_blanca.png';
    };

    return (
        <Container maxWidth={false} sx={{ px: { xs: 0, md: 0 }, pt: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Planos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Selecciona un plano y arrastra las mesas para reorganizar su distribución
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 280 }, maxWidth: 420 }}>
                        <InputLabel id="plano-select-label">Seleccionar Plano</InputLabel>
                        <Select
                            labelId="plano-select-label"
                            id="plano-select"
                            value={planoSeleccionado}
                            label="Seleccionar Plano"
                            onChange={(e) => setPlanoSeleccionado(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>Selecciona un plano</em>
                            </MenuItem>
                            {planos.map((plano) => (
                                <MenuItem key={plano.id} value={plano.id}>
                                    {plano.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Modal_Agregar
                        nombre="plano"
                        recargarComponentes={recargarPlanos}
                        columnas={["Nombre", "Detalles"]}
                        agregar={apiPlanos.crear}
                        campos={Campos_Agregar}
                    />

                    {planoSeleccionado && layout.length > 0 && (
                        <LoadingButton
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleGuardar}
                            loading={guardando}
                        >
                            Guardar Cambios
                        </LoadingButton>
                    )}
                </Box>

                {mensaje.texto && (
                    <Alert 
                        severity={mensaje.tipo || 'info'} 
                        sx={{ mb: 2 }}
                        onClose={() => setMensaje({ tipo: '', texto: '' })}
                    >
                        {mensaje.texto}
                    </Alert>
                )}
            </Box>

            {!planoSeleccionado ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'divider'
                }}>
                    <Typography variant="h6" color="text.secondary">
                        Selecciona un plano para comenzar
                    </Typography>
                </Box>
            ) : layout.length === 0 ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'divider'
                }}>
                    <Typography variant="h6" color="text.secondary">
                        Este plano no tiene mesas asignadas
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        ...boxCardBorder,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 2,
                        minHeight: '560px'
                    }}
                >
                    {planoSeleccionadoObj && (
                        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1.5, py: 1, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight={600}>{planoSeleccionadoObj.nombre}</Typography>
                                {planoSeleccionadoObj.detalles && (
                                    <Typography variant="body2" color="text.secondary">{planoSeleccionadoObj.detalles}</Typography>
                                )}
                            </Box>
                            <Fila_Acciones
                                fila={planoSeleccionadoObj}
                                api={apiPlanos}
                                recargar={recargarPlanos}
                                showEditar={true}
                                showToggle={() => false}
                                campos={Campos_Editar}
                                deleteLabel="plano"
                            />
                        </Stack>
                    )}
                    <ResponsiveGridLayout
                        className="layout"
                        layout={layout}
                        cols={20}
                        rowHeight={50}
                        width={1200}
                        onLayoutChange={handleLayoutChange}
                        isDraggable={true}
                        isResizable={true}
                        compactType={null}
                        preventCollision={false}
                    >
                    {layout.map((item) => (
                            <Box
                                key={item.i}
                                sx={{
                                    bgcolor: 'primary.dark',
                                    color: '#fff',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5,
                                    borderRadius: 1,
                                    fontWeight: 'bold',
                                    cursor: 'move',
                                    boxShadow: 2,
                                    '&:hover': {
                                        boxShadow: 4,
                                        opacity: 0.9
                                    }
                                }}
                            >
                                <ContenidoMesaDistribucion
                                    nombre={obtenerNombreMesa(item.i)}
                                    icono={obtenerIconoMesa(item.i)}
                                />
                            </Box>
                        ))}
                    </ResponsiveGridLayout>
                </Box>
            )}
        </Container>
    );
}

export default Distribucion_mesas;
