import { describe, expect, it, vi } from 'vitest';

const qzMock = {
    websocket: {
        isActive: vi.fn(() => false),
        connect: vi.fn(() => Promise.resolve()),
        disconnect: vi.fn(() => Promise.resolve()),
    },
    api: { getVersion: vi.fn(() => Promise.resolve('2.2.6')) },
};

vi.mock('../qzClient', () => ({ default: qzMock, configureQzSecurity: vi.fn() }));
vi.mock('../printingApi', () => ({ ensureCurrentStationRegistered: vi.fn(() => Promise.resolve()) }));

describe('qzConnection', () => {
    it('shares concurrent connection attempts', async () => {
        const { connectQz } = await import('../qzConnection');
        await Promise.all([connectQz(), connectQz(), connectQz()]);
        expect(qzMock.websocket.connect).toHaveBeenCalledTimes(1);
    });
});
