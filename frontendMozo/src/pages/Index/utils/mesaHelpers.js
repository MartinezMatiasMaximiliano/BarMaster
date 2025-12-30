// utils/mesaHelpers.js
import { DEFAULT_MESA_COORDS } from '../constants/gridConfig';

/**
 * Normaliza un objeto plano para asegurar propiedades consistentes
 * @param {Object} plano - Plano con propiedades en mayúsculas o minúsculas
 * @returns {Object} Plano normalizado con propiedades en minúsculas
 */
export const normalizarPlano = (plano) => ({
    id: plano.id || plano.Id,
    nombre: plano.nombre || plano.Nombre
});

/**
 * Normaliza un objeto mesa para asegurar propiedades consistentes
 * @param {Object} mesa - Mesa con propiedades en mayúsculas o minúsculas
 * @returns {Object} Mesa normalizada con propiedades en minúsculas
 */
export const normalizarMesa = (mesa) => ({
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
export const obtenerIdPlanoDeMesa = (mesa) => {
    const plano = mesa.plano || mesa.Plano;
    if (!plano) return null;
    return plano.id || plano.Id || null;
};

/**
 * Filtra mesas por el ID del plano seleccionado
 * @param {Array} mesas - Array de mesas a filtrar
 * @param {string} planoId - ID del plano por el cual filtrar
 * @returns {Array} Mesas filtradas que pertenecen al plano
 */
export const filtrarMesasPorPlano = (mesas, planoId) => {
    if (!planoId || !mesas || mesas.length === 0) {
        return [];
    }
    
    return mesas.filter(mesa => {
        const idPlanoMesa = obtenerIdPlanoDeMesa(mesa);
        return idPlanoMesa && String(idPlanoMesa) === String(planoId);
    });
};

/**
 * Crea un layout para react-grid-layout a partir de un array de mesas
 * @param {Array} mesas - Array de mesas normalizadas
 * @param {Object} gridConfig - Configuración del grid
 * @returns {Array} Layout compatible con react-grid-layout
 */
export const crearLayoutDesdeMesas = (mesas, gridConfig) => {
    return mesas.map(mesa => ({
        i: mesa.id,
        x: mesa.x,
        y: mesa.y,
        w: mesa.w,
        h: mesa.h,
        minW: gridConfig.minWidth,
        minH: gridConfig.minHeight
    }));
};

/**
 * Obtiene el nombre de una mesa por su ID
 * @param {Array} mesas - Array de mesas donde buscar
 * @param {string} mesaId - ID de la mesa
 * @returns {string} Nombre de la mesa o un nombre por defecto
 */
export const obtenerNombreMesa = (mesas, mesaId) => {
    const mesa = mesas.find(m => m.id === mesaId || m.Id === mesaId);
    if (!mesa) {
        return `Mesa ${mesaId}`;
    }
    return mesa.nombre || mesa.Nombre || `Mesa ${mesaId}`;
};

/**
 * Mapea una mesa normalizada a la estructura que espera el componente Mesa
 * @param {Object} mesa - Mesa normalizada
 * @returns {Object} Datos de mesa en formato esperado por el componente Mesa
 */
export const mapearDatosMesa = (mesa) => ({
    id: mesa.id,
    numeroMesa: mesa.nombre || mesa.Nombre || mesa.id,
    codigoParaPedir: mesa.codigoParaPedir || null,
    persona: mesa.persona || null,
    plano: mesa.plano || null
});

/**
 * Determina el variant de una mesa según el mozo asignado
 * @param {Object} mesa - Mesa con información de persona/mozo
 * @param {Object} mozoRedux - Mozo del estado de Redux
 * @returns {string} Variant de la mesa ('success', 'primary', o 'secondary')
 */
export const obtenerVariantMesa = (mesa, mozoRedux) => {
    if (!mesa.persona) return "secondary";
    if (mozoRedux && mesa.persona.codigoDeServicio === mozoRedux.codigoDeServicio) {
        return "success";
    }
    return "primary";
};

