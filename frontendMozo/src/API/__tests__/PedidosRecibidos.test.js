import { it, expect, vi } from 'vitest';
const { agregar } = vi.hoisted(() => ({ agregar: vi.fn().mockResolvedValue({ id: 'visita' }) }));
vi.mock('../APIVisitas', () => ({ AgregarProductosAVisita: agregar }));
import { registrarPedidoRecibido } from '../../services/pedidosRecibidos';
const id = '12345678-1234-1234-1234-123456789012';
const visitas = [{ id, numeroMesa: '1' }];
it('rechaza identificadores antiguos sin escribir', async () => {
    await expect(registrarPedidoRecibido([{ id: 3 }], 1, visitas, [{ id }])).rejects.toThrow('identificadores antiguos');
    expect(agregar).not.toHaveBeenCalled();
});
it('rechaza una visita incompatible sin escribir', async () => {
    await expect(registrarPedidoRecibido([{ id }], 1, [{ id: 3, numeroMesa: 1 }], [{ id }])).rejects.toThrow('visita actual');
    expect(agregar).not.toHaveBeenCalled();
});
it('solo envía IDs actuales con cantidad y detalles', async () => {
    await registrarPedidoRecibido([{ id, cantidad: 2, indicaciones: 'Sin sal' }], 1, visitas, [{ id }]);
    expect(agregar).toHaveBeenCalledWith(id, [{ IdProducto: id, Cantidad: 2, Detalles: 'Sin sal' }]);
});
