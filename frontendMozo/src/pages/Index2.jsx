import React, { useState, useEffect, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { BuscarTodasLasMesas } from '../API/APIMesas';
import { BuscarTodosLosPlanos } from '../API/APIPlanos';
import MesaGridItem from '../components/Mesa/MesaGridItem';
import { useSelector } from 'react-redux';

const ResponsiveGridLayout = WidthProvider(GridLayout);

// Constantes de configuración del grid
const GRID_CONFIG = {
    cols: 15,
    rowHeight: 50,
    minWidth: 1,
    minHeight: 1
};

// Valores por defecto para coordenadas de mesas
const DEFAULT_MESA_COORDS = {
    x: 0,
    y: 0,
    w: 1,
    h: 1
};

/**
 * Normaliza un objeto plano para asegurar propiedades consistentes
 * @param {Object} plano - Plano con propiedades en mayúsculas o minúsculas
 * @returns {Object} Plano normalizado con propiedades en minúsculas
 */
const normalizarPlano = (plano) => ({
    id: plano.id || plano.Id,
    nombre: plano.nombre || plano.Nombre
});

/**
 * Normaliza un objeto mesa para asegurar propiedades consistentes
 * @param {Object} mesa - Mesa con propiedades en mayúsculas o minúsculas
 * @returns {Object} Mesa normalizada con propiedades en minúsculas
 */
const normalizarMesa = (mesa) => ({
    id: mesa.id || mesa.Id,
    nombre: mesa.nombre || mesa.Nombre,
    x: mesa.x || DEFAULT_MESA_COORDS.x,
    y: mesa.y || DEFAULT_MESA_COORDS.y,
    w: mesa.w || DEFAULT_MESA_COORDS.w,
    h: mesa.h || DEFAULT_MESA_COORDS.h,
    plano: mesa.plano || mesa.Plano || null
});

/**
 * Obtiene el ID del plano de una mesa, manejando diferentes estructuras de datos
 * @param {Object} mesa - Mesa de la cual obtener el ID del plano
 * @returns {string|null} ID del plano o null si no existe
 */
const obtenerIdPlanoDeMesa = (mesa) => {
    const plano = mesa.plano || mesa.Plano;
    if (!plano) return null;
    return plano.id || plano.Id || null;
};

/**
 * Crea un layout para react-grid-layout a partir de un array de mesas
 * @param {Array} mesas - Array de mesas normalizadas
 * @returns {Array} Layout compatible con react-grid-layout
 */
const crearLayoutDesdeMesas = (mesas) => {
    return mesas.map(mesa => ({
        i: mesa.id,
        x: mesa.x,
        y: mesa.y,
        w: mesa.w,
        h: mesa.h,
        minW: GRID_CONFIG.minWidth,
        minH: GRID_CONFIG.minHeight
    }));
};

/**
 * Filtra mesas por el ID del plano seleccionado
 * @param {Array} mesas - Array de mesas a filtrar
 * @param {string} planoId - ID del plano por el cual filtrar
 * @returns {Array} Mesas filtradas que pertenecen al plano
 */
const filtrarMesasPorPlano = (mesas, planoId) => {
    if (!planoId || !mesas || mesas.length === 0) {
        return [];
    }
    
    return mesas.filter(mesa => {
        const idPlanoMesa = obtenerIdPlanoDeMesa(mesa);
        return idPlanoMesa && String(idPlanoMesa) === String(planoId);
    });
};

/**
 * Obtiene el nombre de una mesa por su ID
 * @param {Array} mesas - Array de mesas donde buscar
 * @param {string} mesaId - ID de la mesa
 * @returns {string} Nombre de la mesa o un nombre por defecto
 */
const obtenerNombreMesa = (mesas, mesaId) => {
    const mesa = mesas.find(m => m.id === mesaId || m.Id === mesaId);
    if (!mesa) {
        return `Mesa ${mesaId}`;
    }
    return mesa.nombre || mesa.Nombre || `Mesa ${mesaId}`;
};

function Index2() {
    // Estados
    const [mesas, setMesas] = useState([]);
    const [planos, setPlanos] = useState([]);
    const [planoSeleccionado, setPlanoSeleccionado] = useState('');
    const [cargando, setCargando] = useState(false);
    
    // Obtener mozo del estado de Redux
    const mozo = useSelector((state) => state.mozo.value);

    // Cargar planos al montar el componente
    useEffect(() => {
        const cargarPlanos = async () => {
            if (!localStorage.getItem('token')) {
                return;
            }

            try {
                const data = await BuscarTodosLosPlanos();
                
                if (Array.isArray(data) && data.length > 0) {
                    const planosNormalizados = data.map(normalizarPlano);
                    setPlanos(planosNormalizados);
                    
                    // Seleccionar automáticamente el primer plano
                    if (planosNormalizados.length > 0) {
                        setPlanoSeleccionado(planosNormalizados[0].id);
                    }
                } else {
                    setPlanos([]);
                }
            } catch (error) {
                setPlanos([]);
            }
        };

        cargarPlanos();
    }, []);

    // Cargar mesas desde la API al montar el componente
    useEffect(() => {
        const cargarMesas = async () => {
            if (!localStorage.getItem('token')) {
                return;
            }

            try {
                setCargando(true);
                const mesasData = await BuscarTodasLasMesas();
                
                if (Array.isArray(mesasData) && mesasData.length > 0) {
                    const mesasNormalizadas = mesasData.map(normalizarMesa);
                    setMesas(mesasNormalizadas);
                } else {
                    setMesas([]);
                }
            } catch (error) {
                setMesas([]);
            } finally {
                setCargando(false);
            }
        };

        cargarMesas();
    }, []);

    // Filtrar mesas por plano seleccionado y crear layout
    const mesasFiltradas = useMemo(() => {
        return filtrarMesasPorPlano(mesas, planoSeleccionado);
    }, [mesas, planoSeleccionado]);

    const layout = useMemo(() => {
        return crearLayoutDesdeMesas(mesasFiltradas);
    }, [mesasFiltradas]);

    // Función para obtener la mesa completa por ID
    const obtenerMesaPorId = (mesaId) => {
        return mesasFiltradas.find(m => m.id === mesaId || m.Id === mesaId);
    };

    // Determinar variant según el mozo (por ahora siempre secondary ya que no hay info de mozos)
    const obtenerVariant = (mesa) => {
        // Por el momento, siempre secondary ya que no hay info de mozos
        return "secondary";
    };

    // Handlers
    const handleCambiarPlano = (event) => {
        setPlanoSeleccionado(event.target.value);
    };

    // Renderizado condicional
    const renderContenido = () => {
        if (cargando) {
            return (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: 'calc(98vh - 80px)' 
                }}>
                    <p>Cargando mesas...</p>
                </div>
            );
        }

        if (layout.length === 0) {
            return (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: 'calc(98vh - 80px)' 
                }}>
                    <p>No hay mesas disponibles para este plano</p>
                </div>
            );
        }

        return (
            <ResponsiveGridLayout
                layout={layout}
                cols={GRID_CONFIG.cols}
                rowHeight={GRID_CONFIG.rowHeight}
                isDraggable={false}
                isResizable={false}
                compactType={null}
            >
                {layout.map((item) => {
                    const mesa = obtenerMesaPorId(item.i);
                    if (!mesa) return null;
                    
                    // Mapear la mesa a la estructura que espera el componente Mesa
                    // Por el momento, codigoParaPedir y persona están vacíos
                    const datosMesa = {
                        id: mesa.id,
                        numeroMesa: mesa.nombre || mesa.Nombre || mesa.id,
                        codigoParaPedir: null, // Vacío por el momento
                        persona: null, // Vacío por el momento
                        plano: mesa.plano || mesa.Plano || null
                    };
                    
                    const variant = obtenerVariant(mesa);
                    
                    return (
                        <MesaGridItem
                            key={item.i}
                            datos_mesa={datosMesa}
                            variant={variant}
                            mozo={mozo}
                        />
                    );
                })}
            </ResponsiveGridLayout>
        );
    };

    return (
        <Container className="position-relative" style={{ height: "98vh" }}>
            {/* Selector de planos */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <FormControl size="small" sx={{ minWidth: 250 }}>
                    <InputLabel id="plano-select-label">Seleccionar Plano</InputLabel>
                    <Select
                        labelId="plano-select-label"
                        id="plano-select"
                        value={planoSeleccionado}
                        label="Seleccionar Plano"
                        onChange={handleCambiarPlano}
                        disabled={cargando || planos.length === 0}
                    >
                        {planos.map((plano) => (
                            <MenuItem key={plano.id} value={plano.id}>
                                {plano.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Grid de mesas */}
            {renderContenido()}
        </Container>
    );
}

export default Index2;
