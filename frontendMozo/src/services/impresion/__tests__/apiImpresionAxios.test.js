import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../axiosInstance', () => ({ default: {} }));

describe('reintento administrativo con Axios real', () => {
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

    it('mantiene el token alternativo y vuelve a la selección habitual en solicitudes nuevas', async () => {
        instalarAdaptador((token) => token === 'Bearer usuario');
        const { obtenerImpresoras } = await import('../apiImpresion');
        await expect(obtenerImpresoras()).resolves.toEqual([]);
        await expect(obtenerImpresoras()).resolves.toEqual([]);
        expect(autorizaciones).toEqual(['Bearer sucursal', 'Bearer usuario', 'Bearer sucursal', 'Bearer usuario']);
    });

    it('termina después del único reintento si ambos tokens son rechazados', async () => {
        instalarAdaptador(() => false);
        const { obtenerImpresoras } = await import('../apiImpresion');
        await expect(obtenerImpresoras()).rejects.toMatchObject({ response: { status: 403 } });
        expect(autorizaciones).toEqual(['Bearer sucursal', 'Bearer usuario']);
    });

    it('no reintenta si no existe un token distinto', async () => {
        localStorage.setItem('USER_token', 'sucursal');
        instalarAdaptador(() => false);
        const { obtenerImpresoras } = await import('../apiImpresion');
        await expect(obtenerImpresoras()).rejects.toMatchObject({ response: { status: 403 } });
        expect(autorizaciones).toEqual(['Bearer sucursal']);
    });
});
