import qz, { configureQzSecurity } from './qzClient';
import { ensureCurrentStationRegistered } from './printingApi';

let connectPromise = null;

export async function connectQz() {
    configureQzSecurity();
    if (qz.websocket.isActive()) return;
    if (connectPromise) return connectPromise;

    connectPromise = ensureCurrentStationRegistered()
        .then(() => qz.websocket.connect({ retries: 3, delay: 1 }))
        .finally(() => { connectPromise = null; });
    return connectPromise;
}

export async function disconnectQz() {
    connectPromise = null;
    if (qz.websocket.isActive()) await qz.websocket.disconnect();
}

export async function getQzVersion() {
    await connectQz();
    return qz.api.getVersion();
}

export function isQzConnected() {
    return qz.websocket.isActive();
}
