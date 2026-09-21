import { describe, expect, it, vi } from 'vitest';

const purge = vi.fn(() => Promise.resolve());
vi.mock('../../redux/store', () => ({ persistor: { purge } }));
vi.mock('../impresion/conexionQz', () => ({ desconectarQz: vi.fn(() => Promise.resolve()) }));

describe('limpieza de sesión', () => {
    it('elimina el estado sensible y conserva sólo la identidad de impresión', async () => {
        localStorage.setItem('token', 'secret');
        localStorage.setItem('USER_token', 'person-secret');
        localStorage.setItem('persist:root', 'private-state');
        localStorage.setItem('barmaster.impresion.idInstalacionCliente', 'instalacion');
        localStorage.setItem('barmaster.impresion.a.b.idEstacion', 'estacion');

        const { clearBranchSession } = await import('../sessionCleanup');
        await clearBranchSession();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('persist:root')).toBeNull();
        expect(localStorage.getItem('barmaster.impresion.idInstalacionCliente')).toBe('instalacion');
        expect(localStorage.getItem('barmaster.impresion.a.b.idEstacion')).toBe('estacion');
        expect(purge).toHaveBeenCalledOnce();
    });
});
