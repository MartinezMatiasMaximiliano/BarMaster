import { describe, it, expect, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: { get: vi.fn().mockResolvedValue({ data: [] }), post: vi.fn().mockResolvedValue({ data: {} }), patch: vi.fn().mockResolvedValue({ data: {} }) } }));
vi.mock('../../services/axiosInstance', () => ({ default: api }));
vi.mock('../../connections/HubConnMozo', () => ({ sendHubMessage: vi.fn() }));
import { CrearDeliveryTakeaway, CrearDeliveryTakeawayFromComanda, GetDeliveryTakeaway, obtenerRangoUltimas24Horas } from '../APIDeliveryTakeaway';

describe('Consulta por rango', () => {
    it('envía desde y hasta como parámetros del endpoint', async () => {
        const desde = '2026-09-21T15:00:00.000Z';
        const hasta = '2026-09-22T15:00:00.000Z';

        await GetDeliveryTakeaway(desde, hasta);

        expect(api.get).toHaveBeenLastCalledWith('DeliveryTakeaway', {
            params: { desde, hasta },
        });
    });

    it('genera una ventana exacta de 24 horas', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-09-22T15:00:00.000Z'));

        expect(obtenerRangoUltimas24Horas()).toEqual({
            desde: '2026-09-21T15:00:00.000Z',
            hasta: '2026-09-22T15:00:00.000Z',
        });

        vi.useRealTimers();
    });
});

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
