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
