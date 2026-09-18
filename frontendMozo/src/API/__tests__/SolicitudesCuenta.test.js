import { it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
const { eventos } = vi.hoisted(() => ({ eventos: new Map() }));
vi.mock('../../connections/HubConnMozo', () => ({ default: { on: (nombre, handler) => eventos.set(nombre, handler), off: vi.fn() }, sendHubMessage: vi.fn() }));
import useSignalR from '../../hooks/useSignalR';
it('mensajes de cuenta se entregan como solicitudes sin llamadas de pago', () => {
    const solicitud = vi.fn(); const separada = vi.fn();
    renderHook(() => useSignalR({ onPagarMesa: solicitud, onPagarMesaSeparado: separada }));
    eventos.get('PagarMesa')(123);
    eventos.get('PagarMesaSeparado')([4,5]);
    expect(solicitud).toHaveBeenCalledWith(123);
    expect(separada).toHaveBeenCalledWith([4,5]);
});
