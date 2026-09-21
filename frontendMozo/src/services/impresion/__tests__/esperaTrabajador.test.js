import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearEsperaTrabajador } from '../esperaTrabajador';

describe('limpieza de esperas del trabajador', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it.each([5000, 15000])('no acumula listeners durante 300 ciclos de %i ms', async (duracion) => {
        const controller = new AbortController();
        const agregar = vi.spyOn(controller.signal, 'addEventListener');
        const quitar = vi.spyOn(controller.signal, 'removeEventListener');
        for (let i = 0; i < 300; i++) {
            const espera = crearEsperaTrabajador(duracion, controller.signal);
            if (i % 2) espera.finalizar(); // Notificación de SignalR.
            else await vi.advanceTimersByTimeAsync(duracion);
            await espera.promesa;
            expect(vi.getTimerCount()).toBe(0);
            expect(quitar).toHaveBeenCalledTimes(i + 1);
            expect(quitar.mock.calls[i][1]).toBe(agregar.mock.calls[i][1]);
        }
        controller.abort();
        expect(quitar).toHaveBeenCalledTimes(300);
    });

    it.each([5000, 15000])('detener durante la espera de %i ms la libera y limpia', async (duracion) => {
        const controller = new AbortController();
        const quitar = vi.spyOn(controller.signal, 'removeEventListener');
        const espera = crearEsperaTrabajador(duracion, controller.signal);
        controller.abort();
        await espera.promesa;
        espera.finalizar();
        expect(quitar).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('una señal ya abortada no registra listeners ni temporizadores', async () => {
        const controller = new AbortController();
        controller.abort();
        const agregar = vi.spyOn(controller.signal, 'addEventListener');
        await crearEsperaTrabajador(15000, controller.signal).promesa;
        expect(agregar).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });
});
