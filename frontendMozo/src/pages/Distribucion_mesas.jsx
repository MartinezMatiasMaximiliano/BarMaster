import React, { useState, useEffect, useMemo } from "react";
import { Container, Box, FormControl, InputLabel, Select, MenuItem, Button, Typography, Alert, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import GridLayout, { WidthProvider } from "react-grid-layout";
import SaveIcon from "@mui/icons-material/Save";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { BuscarTodosLosPlanos } from "../API/APIPlanos";
import { ModificarMesa } from "../API/APIMesas";
import { LoadingButton } from "../components/common/LoadingButton";
import { boxCardBorder } from '../styles/boxStyles';

const ResponsiveGridLayout = WidthProvider(GridLayout);

function Distribucion_mesas() {
    const [planos, setPlanos] = useState([]);
    const [planoSeleccionado, setPlanoSeleccionado] = useState('');
    const [mesas, setMesas] = useState([]);
    const [layout, setLayout] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [mostrarAlertaInfo, setMostrarAlertaInfo] = useState(true);

    // Cargar planos al montar el componente
    useEffect(() => {
        const cargarPlanos = async () => {
            if (localStorage.getItem('token')) {
                try {
                    setCargando(true);
                    const data = await BuscarTodosLosPlanos();
                    
                    // Verificar si es un array válido
                    if (Array.isArray(data) && data.length > 0) {
                        // Normalizar los datos (pueden venir con mayúsculas o minúsculas)
                        const planosNormalizados = data.map(plano => ({
                            id: plano.id || plano.Id,
                            nombre: plano.nombre || plano.Nombre,
                            detalles: plano.detalles || plano.Detalles,
                            mesas: plano.mesas || plano.Mesas || []
                        }));
                        setPlanos(planosNormalizados);
                    } else if (Array.isArray(data)) {
                        // Array vacío
                        setPlanos([]);
                        setMensaje({ tipo: 'info', texto: 'No hay planos disponibles' });
                    } else {
                        // No es un array, puede ser un error
                        setPlanos([]);
                        setMensaje({ tipo: 'error', texto: 'Error al cargar los planos. La respuesta no es válida.' });
                    }
                } catch (error) {
                    setMensaje({ tipo: 'error', texto: 'Error al cargar los planos: ' + (error.message || 'Error desconocido') });
                    setPlanos([]);
                } finally {
                    setCargando(false);
                }
            }
        };
        cargarPlanos();
    }, []);

    // Cuando se selecciona un plano, cargar sus mesas y crear el layout
    useEffect(() => {
        if (planoSeleccionado && planos.length > 0) {
            const plano = planos.find(p => p.id === planoSeleccionado);
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
        return mesa ? (mesa.nombre || mesa.Nombre || mesa.numeroMesa || `Mesa ${mesaId}`) : `Mesa ${mesaId}`;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Distribución de Mesas
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Selecciona un plano y arrastra las mesas para reorganizar su distribución
                </Typography>
                {mostrarAlertaInfo && (
                    <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMostrarAlertaInfo(false)}>
                        Para eliminar mesas, andá a <Link to="/abm_mesas">Gestión → Mesas</Link>.
                    </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 250 }}>
                        <InputLabel id="plano-select-label">Seleccionar Plano</InputLabel>
                        <Select
                            labelId="plano-select-label"
                            id="plano-select"
                            value={planoSeleccionado}
                            label="Seleccionar Plano"
                            onChange={(e) => setPlanoSeleccionado(e.target.value)}
                            disabled={cargando}
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

            {cargando ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <CircularProgress />
                </Box>
            ) : !planoSeleccionado ? (
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
                        minHeight: '600px'
                    }}
                >
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
                                    color: 'primary.contrastText',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
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
                                {obtenerNombreMesa(item.i)}
                            </Box>
                        ))}
                    </ResponsiveGridLayout>
                </Box>
            )}
        </Container>
    );
}

export default Distribucion_mesas;
