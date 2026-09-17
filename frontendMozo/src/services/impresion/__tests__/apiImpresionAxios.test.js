import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../axiosInstance', () => ({ default: {} }));

describe('identidad administrativa con Axios real', () => {
    let axios;
    let adaptadorOriginal;
    let autorizaciones;
    beforeEach(async () => {
        vi.resetModules();
        axios = (await import('axios')).default;
        adaptadorOriginal = axios.defaults.adapter;
        autorizaciones = [];
        localStorage.setItem('token', 'sucursal');
        localStorage.setItem('USER_token', 'usuario');
    });
    afterEach(() => { axios.defaults.adapter = adaptadorOriginal; });

    const instalarAdaptador = (aceptar) => {
        axios.defaults.adapter = async (config) => {
            const token = config.headers.get('Authorization');
            autorizaciones.push(token);
            const response = { config, data: [], headers: {}, status: aceptar(token) ? 200 : 403, statusText: '' };
            if (response.status === 403) throw new axios.AxiosError('Forbidden', 'ERR_BAD_REQUEST', config, null, response);
            return response;
        };
    };

    it('usa USER_token de forma estable en solicitudes administrativas', async () => {
        instalarAdaptador((token) => token === 'Bearer usuario');
        const { obtenerImpresoras } = await import('../apiImpresion');
        await expect(obtenerImpresoras()).resolves.toEqual([]);
        await expect(obtenerImpresoras()).resolves.toEqual([]);
        expect(autorizaciones).toEqual(['Bearer usuario', 'Bearer usuario']);
    });

    it('no cambia de identidad ni reintenta cuando recibe 403', async () => {
        instalarAdaptador(() => false);
        const { obtenerImpresoras } = await import('../apiImpresion');
        await expect(obtenerImpresoras()).rejects.toMatchObject({ response: { status: 403 } });
        expect(autorizaciones).toEqual(['Bearer usuario']);
    });

    it('usa el token de sucursal sólo cuando no existe USER_token', async () => {
        localStorage.removeItem('USER_token');
        instalarAdaptador(() => false);
        const { obtenerImpresoras } = await import('../apiImpresion');
        await expect(obtenerImpresoras()).rejects.toMatchObject({ response: { status: 403 } });
        expect(autorizaciones).toEqual(['Bearer sucursal']);
    });
});
