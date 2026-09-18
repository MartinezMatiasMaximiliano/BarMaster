import { afterEach, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { generarUUID } from '../generarUUID';
import { obtenerIdInstalacionCliente } from '../../services/impresion/almacenamientoEstacion';

afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
});

function simularHttpLocal() {
    vi.stubGlobal('crypto', { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) });
}

it('genera UUID v4 distintos sin randomUUID, como al acceder por HTTP en LAN', () => {
    simularHttpLocal();
    const ids = Array.from({ length: 100 }, () => generarUUID());
    for (const id of ids) {
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
    expect(new Set(ids).size).toBe(ids.length);
});

it('usa la implementación nativa cuando está disponible', () => {
    const randomUUID = vi.fn(() => '4f8df59d-c832-47c9-bf23-c1c1d5e715c8');
    vi.stubGlobal('crypto', { randomUUID });
    expect(generarUUID()).toBe('4f8df59d-c832-47c9-bf23-c1c1d5e715c8');
    expect(randomUUID).toHaveBeenCalledOnce();
});

it('conserva el identificador de instalación al volver a solicitarlo por HTTP', () => {
    simularHttpLocal();
    const id = obtenerIdInstalacionCliente();
    expect(obtenerIdInstalacionCliente()).toBe(id);
    expect(localStorage.getItem('barmaster.impresion.idInstalacionCliente')).toBe(id);
});
