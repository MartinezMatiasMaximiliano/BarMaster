/**
 * Filtra filas donde al menos una columna contiene el texto de búsqueda.
 * @param {object[]} filas - Array de objetos (filas de tabla).
 * @param {string} textoBusqueda - Texto a buscar.
 * @param {string[]} columnKeys - Keys de columnas en las que buscar.
 * @returns {object[]} Filas que coinciden.
 */
export function filtrarPorBusqueda(filas, textoBusqueda, columnKeys) {
    if (!textoBusqueda || !textoBusqueda.trim()) return filas;
    const busqueda = textoBusqueda.trim().toLowerCase();
    return filas.filter((fila) =>
        columnKeys.some((key) => {
            const val = fila[key];
            return val != null && String(val).toLowerCase().includes(busqueda);
        })
    );
}

export function tieneFiltroHistorialActivo({ fechaInicio, fechaFin, modoHistorico }) {
    return Boolean(modoHistorico || (fechaInicio && fechaFin));
}

export function estaFechaEnRango(fechaValor, fechaInicio, fechaFin) {
    if (!fechaValor) return false;

    const fecha = new Date(fechaValor);
    if (Number.isNaN(fecha.getTime())) return false;

    if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        if (fecha < inicio) return false;
    }

    if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        if (fecha > fin) return false;
    }

    return true;
}
