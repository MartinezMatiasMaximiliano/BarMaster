import { describe, expect, it, vi } from 'vitest';
import api from '../../services/axiosInstance';
import { BuscarMesasDisponibles, BuscarTodasLasReservas, obtenerRangoMesReservas } from '../APIReservas';
vi.mock('../../services/axiosInstance', () => ({ default: { get: vi.fn() } }));

describe('Disponibilidad de mesas', () => {
    it('excluye reservas del mismo minuto, libera canceladas y ordena por plano y cercanía', async () => {
        api.get.mockResolvedValue({ data: [
            { id: 'cancelada', estadoDisponibilidad: 'verde' }, { id: 'verde', estadoDisponibilidad: 'verde' },
            { id: 'amarilla', estadoDisponibilidad: 'amarilla' }, { id: 'roja', estadoDisponibilidad: 'roja' },
        ] });
        const resultado = await BuscarMesasDisponibles('2026-09-16T20:00:00-03:00');
        expect(resultado.map(m => m.id)).toEqual(['cancelada', 'verde', 'amarilla', 'roja']);
        expect(resultado.map(m => m.estadoDisponibilidad)).toEqual(['verde', 'verde', 'amarilla', 'roja']);
        expect(api.get).toHaveBeenCalledOnce();
        expect(api.get).toHaveBeenCalledWith('Reservas/Disponibilidad', expect.objectContaining({ params: expect.any(Object) }));
    });
    it('propaga errores de consulta en lugar de anunciar mesas libres', async () => {
        api.get.mockRejectedValue(new Error('Sin conexión'));
        await expect(BuscarMesasDisponibles('2026-09-16T20:00:00-03:00')).rejects.toThrow();
    });
});

describe('Consulta de reservas por fechas', () => {
    it('envía desde y hasta al endpoint unificado', async () => {
        api.get.mockResolvedValue({ data: [] });
        const desde = '2026-09-01T12:00:00-03:00';
        const hasta = '2026-09-30T12:00:00-03:00';

        await BuscarTodasLasReservas(desde, hasta);

        expect(api.get).toHaveBeenCalledWith('Reservas', { params: { desde, hasta } });
    });

    it('calcula el mes visible completo', () => {
        expect(obtenerRangoMesReservas(new Date(2026, 8, 15))).toEqual({
            desde: '2026-09-01T12:00:00-03:00',
            hasta: '2026-09-30T12:00:00-03:00',
        });
    });
});
