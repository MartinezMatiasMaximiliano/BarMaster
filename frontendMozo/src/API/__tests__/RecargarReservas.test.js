import { describe, expect, it, vi } from 'vitest';
import { RecargarReservasConservando } from '../APIReservas';

describe('recarga segura de reservas', () => {
    it('preserva los datos anteriores y devuelve error explícito si falla', async () => {
        const asignar = vi.fn();
        const resultado = await RecargarReservasConservando(asignar, () => Promise.reject(new Error('Sin red')));
        expect(resultado.ok).toBe(false);
        expect(resultado.error.message).toMatch(/Sin red|agenda/);
        expect(asignar).not.toHaveBeenCalled();
    });
    it('actualiza y permite una recarga exitosa posterior', async () => {
        const asignar = vi.fn();
        await RecargarReservasConservando(asignar, () => Promise.reject(new Error('Sin red')));
        const resultado = await RecargarReservasConservando(asignar, () => Promise.resolve([{ id: 1 }]));
        expect(resultado).toEqual({ ok: true, datos: [{ id: 1 }] });
        expect(asignar).toHaveBeenCalledWith([{ id: 1 }]);
    });
});
