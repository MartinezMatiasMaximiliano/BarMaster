import { it, expect, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: { delete: vi.fn(), get: vi.fn(), post: vi.fn() } }));
vi.mock('../../services/axiosInstance', () => ({ default: api }));
import { EliminarCuentaCorriente } from '../APICuentasCorrientes';
it('elimina con IdCuenta en la ruta publicada', async () => {
    api.delete.mockResolvedValue({ data: 'Cuenta corriente eliminada' });
    await expect(EliminarCuentaCorriente('cuenta')).resolves.toBe('Cuenta corriente eliminada');
    expect(api.delete).toHaveBeenCalledWith('CuentasCorrientes/Eliminar', { params: { IdCuenta: 'cuenta' } });
});
it('conserva el mensaje de rechazo del backend', async () => {
    api.delete.mockRejectedValue({ response: { data: { message: 'Tiene balance impago' } } });
    await expect(EliminarCuentaCorriente('cuenta')).rejects.toThrow('Tiene balance impago');
});

import { BuscarCuentaCorrientePorId, BuscarTodasLasCuentasCorrientes, CrearCuentaCorriente, ModificarCuentaCorriente } from '../APICuentasCorrientes';
it.each(['Domicilo', 'domicilo', 'Domicilio', 'domicilio'])('listado, detalle, alta y edición aceptan %s', async campo => {
    const cuenta = { Id: 'cuenta', [campo]: ' Calle 123 ' };
    api.get.mockResolvedValueOnce({ data: [cuenta] }).mockResolvedValueOnce({ data: cuenta });
    api.post.mockResolvedValue({ data: cuenta });
    const [listado] = await BuscarTodasLasCuentasCorrientes();
    const detalle = await BuscarCuentaCorrientePorId('cuenta');
    const alta = await CrearCuentaCorriente({ domicilio: 'Calle 123' });
    const edicion = await ModificarCuentaCorriente({ id: 'cuenta', domicilio: 'Calle 123' });
    for (const resultado of [listado, detalle, alta, edicion]) expect(resultado.domicilio).toBe('Calle 123');
});
