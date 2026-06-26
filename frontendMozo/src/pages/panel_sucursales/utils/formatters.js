/**
 * Formatea una fecha a formato legible en español
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Formatea un número como moneda argentina
 * @param {number} cantidad - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
export const formatearMoneda = (cantidad) => {
    return Number(cantidad || 0).toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    });
};

export const formatearNumero = (cantidad) => {
    return Number(cantidad || 0).toLocaleString('es-AR');
};

export const formatearPorcentaje = (cantidad) => {
    return `${Number(cantidad || 0).toLocaleString('es-AR', {
        maximumFractionDigits: 1
    })}%`;
};

export const formatearFechaCorta = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit'
    });
};

export const formatearFechaHora = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

