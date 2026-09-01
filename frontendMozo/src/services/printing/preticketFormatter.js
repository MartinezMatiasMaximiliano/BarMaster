const ESC = '\x1B';
const GS = '\x1D';

function money(value) {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function normalizeProduct(product) {
    return {
        name: product.nombre ?? product.Nombre ?? product.producto?.nombre ?? 'Producto',
        price: Number(product.precioDelMomento ?? product.PrecioDelMomento ?? product.precio ?? 0),
        indications: (product.indicaciones ?? product.Indicaciones ?? '').trim(),
        paid: Boolean(product.pagado ?? product.Pagado ?? product.estaPagado ?? false),
    };
}

export function buildPreticketRaw({ branchName, tableName, products, printedAt = new Date(), paperWidthMm = 80 }) {
    const width = paperWidthMm === 58 ? 32 : 48;
    const grouped = new Map();
    products.map(normalizeProduct).filter((product) => !product.paid).forEach((product) => {
        const key = `${product.name}\u0000${product.price}\u0000${product.indications}`;
        const current = grouped.get(key) || { ...product, quantity: 0 };
        current.quantity += 1;
        grouped.set(key, current);
    });
    if (grouped.size === 0) throw new Error('NO_PRINTABLE_PRODUCTS');

    const lines = [
        `${ESC}@`, `${ESC}a\x01`, branchName || 'BarMaster',
        `Mesa: ${tableName || '-'}`,
        printedAt.toLocaleString('es-AR'),
        'DOCUMENTO NO VALIDO COMO FACTURA',
        '-'.repeat(width), `${ESC}a\x00`,
    ];
    let total = 0;
    grouped.forEach((item) => {
        const subtotal = item.quantity * item.price;
        total += subtotal;
        lines.push(`${item.quantity} x ${item.name}`);
        lines.push(`  $${money(item.price)}  Subtotal $${money(subtotal)}`);
        if (item.indications) lines.push(`  Nota: ${item.indications}`);
    });
    lines.push('-'.repeat(width), `${ESC}a\x02`, `TOTAL $${money(total)}`, `${ESC}a\x00`, '\n\n\n', `${GS}V\x00`);
    return lines.join('\n');
}
