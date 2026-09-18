import qz, { configurarSeguridadQz } from './clienteQz';
import { asegurarEstacionActualRegistrada } from './apiImpresion';

let connectPromise = null;

export async function conectarQz() {
    configurarSeguridadQz();
    if (qz.websocket.isActive()) return;
    if (connectPromise) return connectPromise;

    connectPromise = asegurarEstacionActualRegistrada()
        .then(() => qz.websocket.connect({ retries: 3, delay: 1 }))
        .finally(() => { connectPromise = null; });
    return connectPromise;
}

export async function desconectarQz() {
    connectPromise = null;
    if (qz.websocket.isActive()) await qz.websocket.disconnect();
}

export async function obtenerVersionQz() {
    await conectarQz();
    return qz.api.getVersion();
}

export function estaQzConectado() {
    return qz.websocket.isActive();
}
