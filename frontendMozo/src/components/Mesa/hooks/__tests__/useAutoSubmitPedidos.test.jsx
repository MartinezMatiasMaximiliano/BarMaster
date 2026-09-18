import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAutoSubmitPedidos } from '../useAutoSubmitPedidos';

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('Autoenvío de pedidos', () => {
    it('envía exactamente después de cinco segundos', () => {
        vi.useFakeTimers();
        const onSubmit = vi.fn();
        renderHook(() => useAutoSubmitPedidos({
            activo: true,
            duracionMs: 5000,
            resetKey: 'pedido',
            onSubmit
        }));

        act(() => vi.advanceTimersByTime(4999));
        expect(onSubmit).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(1));
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('reinicia los cinco segundos cuando cambia el buscador', () => {
        vi.useFakeTimers();
        const onSubmit = vi.fn();
        const { result } = renderHook(() => useAutoSubmitPedidos({
            activo: true,
            duracionMs: 5000,
            resetKey: 'pedido',
            onSubmit
        }));

        act(() => vi.advanceTimersByTime(3000));
        act(() => result.current.restart());
        act(() => vi.advanceTimersByTime(4999));
        expect(onSubmit).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(1));
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('permanece detenido en indicaciones y comienza de nuevo al perder foco', () => {
        vi.useFakeTimers();
        const onSubmit = vi.fn();
        const { result } = renderHook(() => useAutoSubmitPedidos({
            activo: true,
            duracionMs: 5000,
            resetKey: 'pedido',
            onSubmit
        }));

        act(() => result.current.pause());
        act(() => vi.advanceTimersByTime(10000));
        expect(onSubmit).not.toHaveBeenCalled();
        act(() => result.current.resume());
        act(() => vi.advanceTimersByTime(5000));
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });
});
