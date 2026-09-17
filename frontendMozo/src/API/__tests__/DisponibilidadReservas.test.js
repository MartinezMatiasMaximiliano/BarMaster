import { describe, expect, it, vi } from 'vitest';
import api from '../../services/axiosInstance';
import { BuscarMesasDisponibles } from '../APIReservas';
vi.mock('../../services/axiosInstance', () => ({ default: { get: vi.fn() } }));

describe('Disponibilidad de mesas', () => {
    it('excluye reservas del mismo minuto, libera canceladas y ordena por plano y cercanía', async () => {
        api.get.mockImplementation(ruta => Promise.resolve({ data: ruta === 'Mesa'
            ? [
                { id: 'ocupada', numero: 1, capacidad: 4, plano: { id: 'patio', nombre: 'Patio' } },
                { id: 'cancelada', numero: 2, capacidad: 4, plano: { id: 'salon', nombre: 'Salón' } },
                { id: 'roja', numero: 10, capacidad: 4, plano: { id: 'salon', nombre: 'Salón' } },
                { id: 'amarilla', numero: 4, capacidad: 4, plano: { id: 'salon', nombre: 'Salón' } },
                { id: 'verde', numero: 3, capacidad: 4, plano: { id: 'salon', nombre: 'Salón' } },
            ]
            : [
                { idMesa: 'ocupada', fechaHora: '2026-09-16T23:00:35Z', estado: { id: 2 } },
                { idMesa: 'cancelada', fechaHora: '2026-09-16T23:00:00Z', estado: { id: 3 } },
                { idMesa: 'roja', fechaHora: '2026-09-16T23:30:00Z', estado: { id: 2 } },
                { idMesa: 'amarilla', fechaHora: '2026-09-17T00:29:00Z', estado: { id: 2 } },
                { idMesa: 'verde', fechaHora: '2026-09-17T00:30:00Z', estado: { id: 2 } },
            ] }));
        const resultado = await BuscarMesasDisponibles('2026-09-16T20:00:00-03:00');
        expect(resultado.map(m => m.id)).toEqual(['cancelada', 'verde', 'amarilla', 'roja']);
        expect(resultado.map(m => m.estadoDisponibilidad)).toEqual(['verde', 'verde', 'amarilla', 'roja']);
    });
    it('propaga errores de consulta en lugar de anunciar mesas libres', async () => {
        api.get.mockRejectedValue(new Error('Sin conexión'));
        await expect(BuscarMesasDisponibles('2026-09-16T20:00:00-03:00')).rejects.toThrow();
    });
});
