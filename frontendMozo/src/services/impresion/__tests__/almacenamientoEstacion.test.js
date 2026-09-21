import { obtenerIdInstalacionCliente, obtenerIdEstacionRegistrada, guardarEstacionRegistrada } from '../almacenamientoEstacion';
import { describe, expect, it } from 'vitest';

describe('almacenamientoEstacion', () => {
    it('crea una identidad estable para la estación', () => {
        const first = obtenerIdInstalacionCliente();
        const second = obtenerIdInstalacionCliente();
        expect(first).toBe(second);
        expect(first).toMatch(/^[0-9a-f-]{36}$/i);
    });

    it('mantiene una estación de servidor distinta por sucursal para una instalación', () => {
        const installationId = obtenerIdInstalacionCliente();
        localStorage.setItem('tenantId', 'tenant-a');
        localStorage.setItem('idSucursal', 'branch-a');
        guardarEstacionRegistrada({ id: 'station-a' });
        localStorage.setItem('idSucursal', 'branch-b');
        guardarEstacionRegistrada({ id: 'station-b' });

        expect(obtenerIdEstacionRegistrada()).toBe('station-b');
        localStorage.setItem('idSucursal', 'branch-a');
        expect(obtenerIdEstacionRegistrada()).toBe('station-a');
        expect(obtenerIdInstalacionCliente()).toBe(installationId);
    });
});
