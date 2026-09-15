import { it, expect, vi } from 'vitest';
import publicApi from '../../services/publicAxiosInstance';
import { ObtenerTicket } from '../APITicket';
it.each([false, true])('ticket conserva tenant de URL con sesión ajena: %s', async (sesion) => {
    localStorage.clear();
    if (sesion) { localStorage.setItem('token', 'token-ajeno'); localStorage.setItem('tenantId', 'tenant-ajeno'); }
    const adapter = vi.fn(async config => ({ data: { id: 'ticket' }, status: 200, statusText: 'OK', headers: {}, config }));
    publicApi.defaults.adapter = adapter;
    await expect(ObtenerTicket('tenant-url', 'ticket')).resolves.toEqual({ id: 'ticket' });
    const config = adapter.mock.lastCall[0];
    expect(config.headers.get('X-Tenant-ID')).toBe('tenant-url');
    expect(config.headers.get('Authorization')).toBeUndefined();
    expect(config.withCredentials).toBe(false);
});
