import { describe, it, expect, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: { post: vi.fn().mockResolvedValue({ data: {} }), patch: vi.fn().mockResolvedValue({ data: {} }) } }));
vi.mock('../../services/axiosInstance', () => ({ default: api }));
vi.mock('../../connections/HubConnMozo', () => ({ sendHubMessage: vi.fn() }));
import { CrearDeliveryTakeaway, CrearDeliveryTakeawayFromComanda } from '../APIDeliveryTakeaway';

describe('Contrato de creación', () => {
    it.each(['Delivery', 'Takeaway'])('%s envía cantidades y detalles con ListaProductos', async (origen) => {
        await CrearDeliveryTakeawayFromComanda({ Cliente: 'Ana', TipoEnvio: '2' }, [{ producto: { id: 'producto' }, cantidad: 3, indicaciones: 'Sin sal' }], origen);
        expect(api.post).toHaveBeenLastCalledWith('DeliveryTakeaway/Crear', expect.objectContaining({ Origen: origen, ListaProductos: [{ IdProducto: 'producto', Cantidad: 3, Detalles: 'Sin sal' }] }));
        expect(api.post.mock.lastCall[1]).not.toHaveProperty('ListaIDProductos');
    });
    it('también admite el formulario simple', async () => {
        await CrearDeliveryTakeaway({ Productos: ['uno', 'dos'] });
        expect(api.post.mock.lastCall[1].ListaProductos).toHaveLength(2);
    });
});

import { CambiarEstadoEntregaDeliveryTakeaway } from '../APIDeliveryTakeaway';
it.each([true, false])('entrega %s usa el endpoint de entrega', async (entregado) => {
    await CambiarEstadoEntregaDeliveryTakeaway('pedido', entregado);
    expect(api.patch).toHaveBeenLastCalledWith('DeliveryTakeaway/Entregado', null, { params: { id: 'pedido', entregado } });
});

import { normalizarDeliveryTakeaway } from '../APIDeliveryTakeaway';
it.each([0, 150])('normaliza MontoAbonado %s y conserva una respuesta ya normalizada', monto => {
    const raw = { NombreCliente: 'Ana', Pago: { MontoAbonado: monto, Vuelto: 10, TipoMovimientoCaja: { Id: 1, Nombre: 'Efectivo', EsEfectivo: true } } };
    const normalizado = normalizarDeliveryTakeaway(raw);
    expect(normalizado.pago.montoRecibido).toBe(monto);
    expect(normalizarDeliveryTakeaway(normalizado)).toEqual(normalizado);
});
