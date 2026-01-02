import ImageCell from "./ImageCell";

/**
 * Función utilitaria para renderizar valores por defecto en las celdas de la tabla
 * @param {Object} row - Fila de datos
 * @param {Object} col - Configuración de la columna
 * @returns {ReactNode} Elemento renderizado
 */
export function defaultRender(row, col) {
    const value = col.value ? col.value(row) : (col.key ? row[col.key] : undefined);

    // Soporte nativo para imágenes
    if (col.type === "image") {
        return <ImageCell src={value} />;
    }

    if (Array.isArray(value)) return value.join(", ");
    return value ?? "";
}

