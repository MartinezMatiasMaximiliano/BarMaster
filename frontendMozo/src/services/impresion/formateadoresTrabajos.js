import { limpiarTextoEscPos } from './textoEscPos';
import { construirPreticketCrudo } from './formateadorPreticket';

const ESC = '\x1B';
const GS = '\x1D';

function construirComandaCruda(contenido, anchoPapelMm) {
    const ancho = anchoPapelMm === 58 ? 32 : 48;
    const lineas = [
        `${ESC}@`, `${ESC}a\x01`, limpiarTextoEscPos(contenido.nombreSucursal || 'BarMaster'),
        `COMANDA - ${limpiarTextoEscPos(contenido.areaProduccion || 'Producción')}`,
        `Mesa: ${limpiarTextoEscPos(contenido.nombreMesa || '-')}`,
        new Date(contenido.solicitadoEnUtc).toLocaleString('es-AR'),
        '-'.repeat(ancho), `${ESC}a\x00`,
    ];
    contenido.lineas.forEach((linea) => {
        lineas.push(`${limpiarTextoEscPos(linea.cantidad)} x ${limpiarTextoEscPos(linea.descripcion)}`);
        if (linea.notas) lineas.push(`  NOTA: ${limpiarTextoEscPos(linea.notas)}`);
    });
    lineas.push('-'.repeat(ancho), '\n\n\n', `${GS}V\x00`);
    return lineas.join('\n');
}

function construirComprobantePagoCrudo(contenido, anchoPapelMm) {
    const ancho = anchoPapelMm === 58 ? 32 : 48;
    const dinero = (valor) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);
    const lineas = [`${ESC}@`, `${ESC}a\x01`];
    // Envolver también direcciones, correos e identificadores largos en papel de 58 mm.
    const texto = (valor) => {
        const limpio = limpiarTextoEscPos(String(valor ?? '')).trim();
        if (!limpio) return;
        let restante = limpio;
        while (restante.length > ancho) {
            const espacio = restante.lastIndexOf(' ', ancho);
            const corte = espacio > 0 ? espacio : ancho;
            lineas.push(restante.slice(0, corte));
            restante = restante.slice(corte).trimStart();
        }
        if (restante) lineas.push(restante);
    };
    const dato = (etiqueta, valor) => { if (valor != null && String(valor).trim()) texto(`${etiqueta}: ${valor}`); };
    const importe = (etiqueta, valor) => texto(`${etiqueta} $${dinero(valor)}`);
    texto(contenido.nombreEmpresa || contenido.nombreSucursal || 'BarMaster');
    if (contenido.nombreEmpresa) dato('Sucursal', contenido.nombreSucursal);
    const cuit = String(contenido.cuit ?? '').replace(/\D/g, '');
    dato('CUIT', cuit.length === 11 ? `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}` : contenido.cuit);
    texto(contenido.direccion);
    dato('Tel.', contenido.telefono);
    dato('Email', contenido.email);
    lineas.push('-'.repeat(ancho));
    texto('COMPROBANTE DE PAGO');
    texto('NO FISCAL');
    texto(new Date(contenido.solicitadoEnUtc).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }));
    lineas.push(`${ESC}a\x00`);
    const idPago = String(contenido.referenciaPago ?? '').replace(
        /^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})$/i,
        '$1-$2-$3-$4-$5',
    );
    if (idPago) {
        texto('ID del pago:');
        texto(idPago);
    }
    dato(contenido.origen && contenido.origen !== 'Local' ? 'Origen' : 'Mesa', contenido.nombreMesa);
    dato('Medio de pago', contenido.medioPago);
    lineas.push('-'.repeat(ancho));
    contenido.lineas.forEach((linea) => {
        texto(`${linea.cantidad} x ${linea.descripcion}`);
        texto(`  $${dinero(linea.precioUnitario)}  Subtotal $${dinero(linea.cantidad * linea.precioUnitario)}`);
        if (linea.notas) dato('Nota', linea.notas);
    });
    lineas.push('-'.repeat(ancho), `${ESC}a\x02`);
    const subtotal = contenido.subtotal ?? contenido.lineas.reduce((total, linea) => total + linea.cantidad * linea.precioUnitario, 0);
    importe('SUBTOTAL', subtotal);
    if (contenido.ajustePedido) importe('AJUSTE DEL PEDIDO', contenido.ajustePedido);
    if (contenido.descuento) texto(`DESCUENTO -$${dinero(contenido.descuento)}`);
    if (contenido.recargo) importe('RECARGO', contenido.recargo);
    lineas.push(`${ESC}E\x01`);
    importe('TOTAL', contenido.total);
    lineas.push(`${ESC}E\x00`);
    importe('ABONADO', contenido.montoAbonado);
    importe('VUELTO', contenido.vuelto);
    lineas.push(`${ESC}a\x01`, '-'.repeat(ancho));
    texto('DOCUMENTO NO VALIDO COMO FACTURA');
    texto('Gracias por su visita');
    lineas.push(`${ESC}a\x00`, '\n\n\n', `${GS}V\x00`);
    return lineas.join('\n');
}

export function formatearTrabajoCrudo(trabajo) {
    let contenido;
    try { contenido = JSON.parse(trabajo.contenidoJson); }
    catch { throw new Error('DOCUMENTO_IMPRESION_INVALIDO'); }
    if (trabajo.versionEsquema !== 1 || trabajo.versionPlantilla !== 1) throw new Error('PLANTILLA_IMPRESION_NO_COMPATIBLE');
    if (!contenido || !Array.isArray(contenido.lineas) || contenido.lineas.length === 0
        || !Number.isFinite(new Date(contenido.solicitadoEnUtc).getTime())
        || contenido.lineas.some((linea) => !linea || !Number.isSafeInteger(linea.cantidad) || linea.cantidad <= 0
            || typeof linea.descripcion !== 'string' || !linea.descripcion.trim()
            || (linea.notas != null && typeof linea.notas !== 'string')
            || (['Preticket', 'ComprobantePago'].includes(trabajo.tipoDocumento) && (typeof linea.precioUnitario !== 'number' || !Number.isFinite(linea.precioUnitario)))))
        throw new Error('DOCUMENTO_IMPRESION_INVALIDO');
    if (trabajo.tipoDocumento === 'Preticket') {
        return construirPreticketCrudo({
            ...contenido,
            productos: contenido.lineas.flatMap((linea) => Array.from({ length: linea.cantidad }, () => ({
                nombre: linea.descripcion, precioDelMomento: linea.precioUnitario, indicaciones: linea.notas, pagado: false,
            }))),
            impresoEn: new Date(contenido.solicitadoEnUtc), anchoPapelMm: trabajo.anchoPapelMm,
        });
    }
    if (trabajo.tipoDocumento === 'ComprobantePago') {
        const obligatorios = ['total', 'montoAbonado', 'vuelto'];
        const opcionales = ['subtotal', 'ajustePedido', 'descuento', 'recargo'];
        if (obligatorios.some((campo) => typeof contenido[campo] !== 'number' || !Number.isFinite(contenido[campo]))
            || opcionales.some((campo) => contenido[campo] != null && (typeof contenido[campo] !== 'number' || !Number.isFinite(contenido[campo]))))
            throw new Error('DOCUMENTO_IMPRESION_INVALIDO');
        return construirComprobantePagoCrudo(contenido, trabajo.anchoPapelMm);
    }
    if (trabajo.tipoDocumento === 'Comanda') return construirComandaCruda(contenido, trabajo.anchoPapelMm);
    throw new Error('DOCUMENTO_IMPRESION_NO_COMPATIBLE');
}
