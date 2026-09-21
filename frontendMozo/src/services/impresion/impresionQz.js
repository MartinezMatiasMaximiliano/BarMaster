import qz from './clienteQz';
import { requerirImpresora } from './impresorasQz';

const ESC = '\x1B';
const PAGINAS_CARACTERES_ESC_POS = new Map([
    ['CP437', 0], ['IBM437', 0],
    ['CP850', 2], ['IBM850', 2],
    ['CP860', 3], ['IBM860', 3],
    ['CP863', 4], ['IBM863', 4],
    ['CP865', 5], ['IBM865', 5],
    ['WINDOWS1252', 16], ['CP1252', 16],
    ['CP866', 17], ['IBM866', 17],
    ['CP852', 18], ['IBM852', 18],
    ['CP858', 19], ['IBM858', 19], ['IBM00858', 19],
]);

function normalizarCodificacion(codificacion) {
    return String(codificacion ?? '').trim().toUpperCase().replace(/[-_]/g, '');
}

export function seleccionarPaginaCaracteres(datosCrudos, codificacion = 'CP858') {
    const pagina = PAGINAS_CARACTERES_ESC_POS.get(normalizarCodificacion(codificacion));
    if (pagina == null) return datosCrudos;

    const inicializar = `${ESC}@`;
    const seleccionarPagina = `${ESC}t${String.fromCharCode(pagina)}`;
    const posicionInicializar = datosCrudos.indexOf(inicializar);
    if (posicionInicializar < 0) return `${seleccionarPagina}${datosCrudos}`;

    const despuesDeInicializar = posicionInicializar + inicializar.length;
    return `${datosCrudos.slice(0, despuesDeInicializar)}${seleccionarPagina}${datosCrudos.slice(despuesDeInicializar)}`;
}

function crearConfiguracion(nombreImpresora, opciones = {}) {
    const configuracionQz = {
        copies: opciones.copias ?? 1,
        jobName: opciones.nombreTrabajo ?? 'BarMaster',
        encoding: opciones.codificacion ?? 'CP858',
    };
    return qz.configs.create(nombreImpresora, configuracionQz);
}

export async function imprimirCrudo(nombreImpresora, datosCrudos, opciones = {}) {
    if (!opciones.omitirComprobacionImpresora) await requerirImpresora(nombreImpresora);
    const configuracion = crearConfiguracion(nombreImpresora, opciones);
    const datosConPaginaCaracteres = seleccionarPaginaCaracteres(datosCrudos, opciones.codificacion);
    return qz.print(configuracion, [{
        type: 'raw',
        format: 'command',
        flavor: 'plain',
        data: datosConPaginaCaracteres,
    }]);
}
