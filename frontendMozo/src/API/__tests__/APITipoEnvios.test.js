import { it, expect, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: { patch: vi.fn(), get: vi.fn() } }));
vi.mock('../../services/axiosInstance', () => ({ default: api }));
import { ModificarTipoEnvio, BuscarTodosLosTipoEnvios } from '../APITipoEnvios';
it('edición y recarga presentan el mismo objeto actualizado', async () => {
    const actualizado = { Id: 2, Nombre: 'Moto', Precio: 0 };
    api.patch.mockResolvedValue({ data: actualizado }); api.get.mockResolvedValue({ data: [actualizado] });
    const editado = await ModificarTipoEnvio({ id: 2, nombre: 'Moto', precio: 0 });
    expect(editado).toEqual({ id: 2, nombre: 'Moto', precio: 0 });
    expect(await BuscarTodosLosTipoEnvios()).toEqual([editado]);
});
