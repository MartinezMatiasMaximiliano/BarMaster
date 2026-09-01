import { describe, expect, it, vi } from 'vitest';

const purge = vi.fn(() => Promise.resolve());
vi.mock('../../redux/store', () => ({ persistor: { purge } }));
vi.mock('../printing/qzConnection', () => ({ disconnectQz: vi.fn(() => Promise.resolve()) }));

describe('session cleanup', () => {
    it('purges sensitive state and preserves only printing identity/cache', async () => {
        localStorage.setItem('token', 'secret');
        localStorage.setItem('USER_token', 'person-secret');
        localStorage.setItem('persist:root', 'private-state');
        localStorage.setItem('barmaster.printing.stationId', 'station');
        localStorage.setItem('barmaster.printing.a.b.station.assignments', '[]');

        const { clearBranchSession } = await import('../sessionCleanup');
        await clearBranchSession();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('persist:root')).toBeNull();
        expect(localStorage.getItem('barmaster.printing.stationId')).toBe('station');
        expect(localStorage.getItem('barmaster.printing.a.b.station.assignments')).toBe('[]');
        expect(purge).toHaveBeenCalledOnce();
    });
});
