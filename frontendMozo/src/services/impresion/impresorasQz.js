import qz from './clienteQz';
import { conectarQz } from './conexionQz';

export async function buscarImpresoras() {
    await conectarQz();
    const impresoras = await qz.printers.find();
    return [...impresoras].sort((a, b) => a.localeCompare(b));
}

export async function requerirImpresora(nombreImpresora) {
    if (!nombreImpresora?.trim()) throw new Error('IMPRESORA_NO_CONFIGURADA');
    const impresoras = await buscarImpresoras();
    if (!impresoras.includes(nombreImpresora)) throw new Error('IMPRESORA_NO_ENCONTRADA');
    return nombreImpresora;
}
