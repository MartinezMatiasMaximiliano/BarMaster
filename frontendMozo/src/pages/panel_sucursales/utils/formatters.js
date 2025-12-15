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
    return cantidad.toLocaleString('es-AR');
};

