import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, apiAdministrativaMock, apiEstacionMock } = vi.hoisted(() => {
    const crearCliente = () => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        request: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    });
    return {
        apiMock: crearCliente(),
        apiAdministrativaMock: crearCliente(),
        apiEstacionMock: crearCliente(),
    };
});

vi.mock('../../axiosInstance', () => ({ default: apiMock }));
vi.mock('axios', () => ({
    default: {
        create: vi.fn()
            .mockReturnValueOnce(apiAdministrativaMock)
            .mockReturnValueOnce(apiEstacionMock),
    },
}));

describe('registro automático de la estación de impresión', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('barmaster.impresion.idInstalacionCliente', 'e43e8aad-0000-0000-0000-000000000000');
    });

    it('conserva el nombre existente cuando la conexión automática no recibe uno', async () => {
        apiMock.get.mockResolvedValue({ data: { id: 'estacion-1', nombre: 'Cocina principal' } });
        apiMock.post.mockResolvedValue({ data: { id: 'estacion-1', nombre: 'Cocina principal' } });
        const { registrarEstacionActual } = await import('../apiImpresion');

        await registrarEstacionActual();

        expect(apiMock.post).toHaveBeenCalledWith('impresion/estaciones/registrar', {
            idInstalacionCliente: 'e43e8aad-0000-0000-0000-000000000000',
            nombre: 'Cocina principal',
        });
    });

    it('usa el nombre generado solamente cuando la estación todavía no existe', async () => {
        apiMock.get.mockRejectedValue({ response: { status: 404 } });
        apiMock.post.mockResolvedValue({ data: { id: 'estacion-1', nombre: 'Caja e43e8aad' } });
        const { registrarEstacionActual } = await import('../apiImpresion');

        await registrarEstacionActual();

        expect(apiMock.post).toHaveBeenCalledWith('impresion/estaciones/registrar', {
            idInstalacionCliente: 'e43e8aad-0000-0000-0000-000000000000',
            nombre: 'Caja e43e8aad',
        });
    });
});
