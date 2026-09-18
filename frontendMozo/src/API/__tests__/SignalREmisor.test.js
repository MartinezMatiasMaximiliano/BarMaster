import { it, expect, vi } from 'vitest';
const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('@microsoft/signalr', async importOriginal => {
    const actual = await importOriginal();
    return { ...actual, HubConnectionBuilder: class {
        withUrl() { return this; } withAutomaticReconnect() { return this; }
        build() { return { state: actual.HubConnectionState.Connected, send, onreconnected() {} }; }
    } };
});
import { sendHubMessage } from '../../connections/HubConnMozo';
it('el emisor normaliza mesa antes del transporte', async () => {
    await sendHubMessage('RecargarTicket', '12');
    expect(send).toHaveBeenCalledWith('RecargarTicket', 12);
});
it('mesa inválida produce un aviso visible y no llega al transporte', async () => {
    const aviso = vi.fn();
    window.addEventListener('error-signalr', aviso);
    try {
        expect(await sendHubMessage('MesaCerrada', 'abc')).toBe(false);
        expect(send).not.toHaveBeenCalled();
        expect(aviso.mock.lastCall[0].detail).toContain('Número de mesa inválido');
    } finally { window.removeEventListener('error-signalr', aviso); }
});
