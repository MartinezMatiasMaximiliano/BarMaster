import { limpiarTextoEscPos } from './textoEscPos';

const ESC = '\x1B';
const GS = '\x1D';

function dinero(valor) {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(valor) || 0);
}

function normalizarProducto(producto) {
    return {
        nombre: limpiarTextoEscPos(producto.nombre ?? producto.Nombre ?? producto.producto?.nombre ?? 'Producto'),
        precio: Number(producto.precioDelMomento ?? producto.PrecioDelMomento ?? producto.precio ?? 0),
        indicaciones: limpiarTextoEscPos(producto.indicaciones ?? producto.Indicaciones ?? '').trim(),
        pagado: Boolean(producto.pagado ?? producto.Pagado ?? producto.estaPagado ?? false),
    };
}

export function construirPreticketCrudo({ nombreSucursal, nombreMesa, productos, impresoEn = new Date(), anchoPapelMm = 80 }) {
    const ancho = anchoPapelMm === 58 ? 32 : 48;
    const agrupados = new Map();
    productos.map(normalizarProducto).filter((producto) => !producto.pagado).forEach((producto) => {
        const clave = `${producto.nombre}\u0000${producto.precio}\u0000${producto.indicaciones}`;
        const actual = agrupados.get(clave) || { ...producto, cantidad: 0 };
        actual.cantidad += 1;
        agrupados.set(clave, actual);
    });
    if (agrupados.size === 0) throw new Error('SIN_PRODUCTOS_IMPRIMIBLES');

    const lineas = [
        `${ESC}@`, `${ESC}a\x01`, limpiarTextoEscPos(nombreSucursal || 'BarMaster'),
        `Mesa: ${limpiarTextoEscPos(nombreMesa || '-')}`,
        impresoEn.toLocaleString('es-AR'),
        'DOCUMENTO NO VALIDO COMO FACTURA',
        '-'.repeat(ancho), `${ESC}a\x00`,
    ];
    let total = 0;
    agrupados.forEach((elemento) => {
        const subtotal = elemento.cantidad * elemento.precio;
        total += subtotal;
        lineas.push(`${elemento.cantidad}x ${elemento.nombre}`);
        lineas.push(`  $${dinero(elemento.precio)}  Subt. $${dinero(subtotal)}`);
        if (elemento.indicaciones) lineas.push(`  Nota: ${elemento.indicaciones}`);
    });
    lineas.push('-'.repeat(ancho), `${ESC}a\x02`, `TOTAL $${dinero(total)}`, `${ESC}a\x00`, '\n\n\n', `${GS}V\x00`);
    return lineas.join('\n');
}
