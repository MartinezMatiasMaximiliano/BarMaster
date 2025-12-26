/**
 * Constantes para el componente de filtros
 */

export const FILTER_TYPES = {
    TEXT: 'text',
    NUMBER: 'number',
    SELECT: 'select'
};

export const DEFAULT_FILTER_TYPE = FILTER_TYPES.TEXT;

export const FILTER_INPUT_PROPS = {
    [FILTER_TYPES.TEXT]: {
        label: 'Buscar',
        placeholder: 'Escriba para filtrar...',
        type: 'text'
    },
    [FILTER_TYPES.NUMBER]: {
        label: 'Valor',
        placeholder: 'Ingrese número...',
        type: 'number'
    },
    [FILTER_TYPES.SELECT]: {
        label: 'Valor',
        placeholder: 'Seleccionar...'
    }
};

