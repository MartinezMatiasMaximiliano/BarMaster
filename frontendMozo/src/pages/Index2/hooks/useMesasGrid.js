// hooks/useMesasGrid.js
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { filtrarMesasPorPlano, crearLayoutDesdeMesas, mapearDatosMesa, obtenerVariantMesa } from '../utils/mesaHelpers';
import { GRID_CONFIG } from '../constants/gridConfig';

/**
 * Hook para filtrar mesas por plano y crear el layout del grid
 * @param {Array} mesas - Array de mesas normalizadas
 * @param {string} planoSeleccionado - ID del plano seleccionado
 * @returns {Object} { mesasFiltradas, layout, obtenerMesaPorId, obtenerDatosMesa }
 */
export const useMesasGrid = (mesas, planoSeleccionado) => {
    const mozoRedux = useSelector((state) => state.mozo.value);

    // Filtrar mesas por plano seleccionado
    const mesasFiltradas = useMemo(() => {
        return filtrarMesasPorPlano(mesas, planoSeleccionado);
    }, [mesas, planoSeleccionado]);

    // Crear layout para react-grid-layout
    const layout = useMemo(() => {
        return crearLayoutDesdeMesas(mesasFiltradas, GRID_CONFIG);
    }, [mesasFiltradas]);

    // Función para obtener la mesa completa por ID
    const obtenerMesaPorId = (mesaId) => {
        return mesasFiltradas.find(m => m.id === mesaId || m.Id === mesaId);
    };

    // Función para obtener los datos de mesa formateados para el componente Mesa
    const obtenerDatosMesa = (mesa) => {
        if (!mesa) return null;
        
        const datosMesa = mapearDatosMesa(mesa);
        const variant = obtenerVariantMesa(mesa, mozoRedux);
        
        return {
            datosMesa,
            variant,
            mozo: mozoRedux
        };
    };

    return {
        mesasFiltradas,
        layout,
        obtenerMesaPorId,
        obtenerDatosMesa
    };
};

