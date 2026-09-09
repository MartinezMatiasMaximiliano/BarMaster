import qz from './clienteQz';
import { conectarQz } from './conexionQz';

const IMPRESORAS_VIRTUALES_BLOQUEADAS = new Set([
    'microsoft print to pdf',
]);

export function esImpresoraPermitida(nombreImpresora) {
    return !IMPRESORAS_VIRTUALES_BLOQUEADAS.has(nombreImpresora?.trim().toLocaleLowerCase());
}

export async function buscarImpresoras() {
    await conectarQz();
    const impresoras = await qz.printers.find();
    return [...impresoras]
        .filter(esImpresoraPermitida)
        .sort((a, b) => a.localeCompare(b));
}

export async function requerirImpresora(nombreImpresora) {
    if (!nombreImpresora?.trim()) throw new Error('IMPRESORA_NO_CONFIGURADA');
    const impresoras = await buscarImpresoras();
    if (!impresoras.includes(nombreImpresora)) throw new Error('IMPRESORA_NO_ENCONTRADA');
    return nombreImpresora;
}
