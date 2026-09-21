import { describe, expect, it, vi } from 'vitest';

const qzMock = {
    websocket: {
        isActive: vi.fn(() => false),
        connect: vi.fn(() => Promise.resolve()),
        disconnect: vi.fn(() => Promise.resolve()),
    },
    api: { getVersion: vi.fn(() => Promise.resolve('2.2.6')) },
};

vi.mock('../clienteQz', () => ({ default: qzMock, configurarSeguridadQz: vi.fn() }));
vi.mock('../apiImpresion', () => ({ asegurarEstacionActualRegistrada: vi.fn(() => Promise.resolve()) }));

describe('conexionQz', () => {
    it('comparte los intentos concurrentes de conexión', async () => {
        const { conectarQz } = await import('../conexionQz');
        await Promise.all([conectarQz(), conectarQz(), conectarQz()]);
        expect(qzMock.websocket.connect).toHaveBeenCalledTimes(1);
    });
});
