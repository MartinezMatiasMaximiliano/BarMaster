import qz from './clienteQz';
import { requerirImpresora } from './impresorasQz';

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
    return qz.print(configuracion, [{
        type: 'raw',
        format: 'command',
        flavor: 'plain',
        data: datosCrudos,
    }]);
}
