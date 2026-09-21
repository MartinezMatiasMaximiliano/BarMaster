/** Helpers compartidos para los sub-componentes de Lista_Items */

export const getEstadoColor = (estadoPedido) => {
    if (!estadoPedido) return 'default';
    if (estadoPedido === 'Listo') return 'info';
    if (estadoPedido === 'En Preparación') return 'warning';
    return 'default';
};

export const getNombre = (producto) => producto.nombre || producto.nombreProducto;

export const getPrecio = (producto) => producto.precio || producto.precioDelMomento || 0;

export const getIndicaciones = (producto) => producto.indicaciones
    ?? producto.detalles
    ?? producto.Indicaciones
    ?? producto.Detalles
    ?? '';
