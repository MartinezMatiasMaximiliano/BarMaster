// Conserva el día local del operario, también para fechas recibidas en UTC.
export function claveDia(valor) {
    const fecha = new Date(valor);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}
