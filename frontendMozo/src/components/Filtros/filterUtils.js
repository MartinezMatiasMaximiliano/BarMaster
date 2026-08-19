/**
 * Utilidades para el filtrado de datos
 */

import { FILTER_TYPES } from './constants';

/**
 * Filtra las columnas excluyendo las que no son filtrables
 * @param {Array} columnas - Array de columnas de la tabla
 * @returns {Array} Columnas filtrables
 */
export const obtenerColumnasFiltrables = (columnas) => {
    if (!columnas || !Array.isArray(columnas)) {
        return [];
    }

    return columnas.filter(col => 
        col.key && 
        col.key !== '__acciones' && 
        col.filtrable !== false &&
        col.label && 
        col.label.trim() !== ''
    );
};

/**
 * Obtiene las opciones para un select desde la configuración o los datos
 * @param {Object} configColumna - Configuración de la columna
 * @param {Array} filas - Array de filas de datos
 * @param {string} columnaSeleccionada - Nombre de la columna seleccionada
 * @returns {Array} Array de opciones para el select
 */
export const obtenerOpcionesSelect = (configColumna, filas, columnaSeleccionada) => {
    // Si hay opciones predefinidas, usarlas
    if (configColumna?.opciones && Array.isArray(configColumna.opciones)) {
        return configColumna.opciones;
    }
    
    // Si no hay opciones predefinidas, extraer valores únicos de los datos
    if (filas && filas.length > 0 && columnaSeleccionada) {
        const valoresUnicos = [...new Set(
            filas
                .map(fila => fila[columnaSeleccionada])
                .filter(v => v != null && v !== '')
        )];
        
        return valoresUnicos.map((valor, index) => ({ 
            id: index, 
            nombre: String(valor) 
        }));
    }
    
    return [];
};

/**
 * Aplica un filtro a las filas según el tipo de filtro
 * @param {Array} filas - Array de filas a filtrar
 * @param {string} campo - Campo por el cual filtrar
 * @param {string} valor - Valor del filtro
 * @param {string} tipoColumna - Tipo de columna (text, number, select)
 * @returns {Array} Filas filtradas
 */
export const aplicarFiltro = (filas, campo, valor, tipoColumna) => {
    if (!filas || filas.length === 0) {
        return [];
    }

    if (!campo || !valor || valor === '') {
        return filas;
    }

    return filas.filter(fila => {
        const valorFila = fila[campo];
        
        if (valorFila == null) return false;

        switch (tipoColumna) {
            case FILTER_TYPES.SELECT:
                // Para select, comparar por nombre (case insensitive)
                return String(valorFila).toLowerCase() === String(valor).toLowerCase();
            
            case FILTER_TYPES.TEXT:
                // Para texto, búsqueda parcial (case insensitive)
                return String(valorFila).toLowerCase().includes(String(valor).toLowerCase());
            
            case FILTER_TYPES.NUMBER:
                // Para número, comparación exacta
                return Number(valorFila) === Number(valor);
            
            default:
                return true;
        }
    });
};

/**
 * Obtiene el tipo de filtro para una columna
 * @param {Object} configColumna - Configuración de la columna
 * @returns {string} Tipo de filtro
 */
export const obtenerTipoFiltro = (configColumna) => {
    return configColumna?.tipo || FILTER_TYPES.TEXT;
};

