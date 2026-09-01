import { persistor } from '../redux/store';
import { isPrintingStorageKey } from './printing/stationStorage';

const PERSON_PREFIX = 'USER_';

export function clearPersonSession() {
    Object.keys(localStorage)
        .filter((key) => key.startsWith(PERSON_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
}

export async function clearBranchSession() {
    try {
        const { disconnectQz } = await import('./printing/qzConnection');
        await disconnectQz();
    } catch {
        // El cierre de sesión no debe quedar bloqueado si QZ no responde.
    }

    const printingEntries = Object.keys(localStorage)
        .filter(isPrintingStorageKey)
        .map((key) => [key, localStorage.getItem(key)]);

    localStorage.clear();
    printingEntries.forEach(([key, value]) => {
        if (value !== null) localStorage.setItem(key, value);
    });
    await persistor.purge();
}
