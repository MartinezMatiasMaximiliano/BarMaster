import { persistor } from '../redux/store';
import { esClaveAlmacenamientoImpresion } from './impresion/almacenamientoEstacion';

const PERSON_PREFIX = 'USER_';

export function clearPersonSession() {
    Object.keys(localStorage)
        .filter((key) => key.startsWith(PERSON_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
}

export async function clearBranchSession() {
    try {
        const { desconectarQz } = await import('./impresion/conexionQz');
        const { detenerTrabajadorImpresion } = await import('./impresion/trabajadorImpresion');
        detenerTrabajadorImpresion();
        await desconectarQz();
    } catch {
        // El cierre de sesión no debe quedar bloqueado si QZ no responde.
    }

    const printingEntries = Object.keys(localStorage)
        .filter(esClaveAlmacenamientoImpresion)
        .map((key) => [key, localStorage.getItem(key)]);

    localStorage.clear();
    printingEntries.forEach(([key, value]) => {
        if (value !== null) localStorage.setItem(key, value);
    });
    await persistor.purge();
}
