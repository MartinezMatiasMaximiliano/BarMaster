import { it, expect, vi } from 'vitest';
import { JsonHubProtocol, MessageType } from '@microsoft/signalr';
import { normalizarArgumentosHub } from '../../connections/argumentosHub';
it.each(['RecargarTicket', 'MesaCerrada'])('%s serializa mesa como entero en protocolo SignalR real', metodo => {
    const protocolo = new JsonHubProtocol();
    const texto = protocolo.writeMessage({ type: MessageType.Invocation, target: metodo, arguments: normalizarArgumentosHub(metodo, ['12']) });
    const [mensaje] = protocolo.parseMessages(texto, { log: vi.fn() });
    expect(mensaje.arguments).toEqual([12]);
    expect(texto).toContain('"arguments":[12]');
});
it.each(['', 'abc', null, true, 1.5, Infinity, 2147483648])('rechaza mesa inválida %s', valor => {
    expect(() => normalizarArgumentosHub('RecargarTicket', [valor])).toThrow('Número de mesa inválido');
});
