import { construirPreticketCrudo } from './formateadorPreticket';

const ESC = '\x1B';
const GS = '\x1D';

function construirComandaCruda(contenido, anchoPapelMm) {
    const ancho = anchoPapelMm === 58 ? 32 : 48;
    const lineas = [
        `${ESC}@`, `${ESC}a\x01`, contenido.nombreSucursal || 'BarMaster',
        `COMANDA - ${contenido.areaProduccion || 'Producción'}`,
        `Mesa: ${contenido.nombreMesa || '-'}`,
        new Date(contenido.solicitadoEnUtc).toLocaleString('es-AR'),
        '-'.repeat(ancho), `${ESC}a\x00`,
    ];
    contenido.lineas.forEach((linea) => {
        lineas.push(`${linea.cantidad} x ${linea.descripcion}`);
        if (linea.notas) lineas.push(`  NOTA: ${linea.notas}`);
    });
    lineas.push('-'.repeat(ancho), '\n\n\n', `${GS}V\x00`);
    return lineas.join('\n');
}

export function formatearTrabajoCrudo(trabajo) {
    const contenido = JSON.parse(trabajo.contenidoJson);
    if (trabajo.versionEsquema !== 1 || trabajo.versionPlantilla !== 1) throw new Error('PLANTILLA_IMPRESION_NO_COMPATIBLE');
    if (trabajo.tipoDocumento === 'Preticket') {
        return construirPreticketCrudo({
            ...contenido,
            productos: contenido.lineas.flatMap((linea) => Array.from({ length: linea.cantidad }, () => ({
                nombre: linea.descripcion, precioDelMomento: linea.precioUnitario, indicaciones: linea.notas, pagado: false,
            }))),
            impresoEn: new Date(contenido.solicitadoEnUtc), anchoPapelMm: trabajo.anchoPapelMm,
        });
    }
    if (trabajo.tipoDocumento === 'Comanda') return construirComandaCruda(contenido, trabajo.anchoPapelMm);
    throw new Error('DOCUMENTO_IMPRESION_NO_COMPATIBLE');
}
