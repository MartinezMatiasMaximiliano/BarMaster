import { describe, expect, it } from 'vitest';
import { agruparYOrdenarMesas, estadoMesa } from '../dominioDisponibilidad';

const mesa = (id, capacidad, estado, plano = 'salon') => ({ id, numero: Number(id), capacidad,
    estadoDisponibilidad: estado, plano: { id: plano, nombre: plano } });

describe('dominio de disponibilidad', () => {
    it('ordena en ambas direcciones por disponibilidad y capacidad', () => {
        const mesas = [mesa('1', 4, 'roja'), mesa('2', 2, 'verde'), mesa('3', 6, 'amarilla')];
        expect(agruparYOrdenarMesas(mesas).salon.mesas.map(x => x.id)).toEqual(['2', '3', '1']);
        expect(agruparYOrdenarMesas(mesas, 'disponibilidad', 'desc').salon.mesas.map(x => x.id)).toEqual(['1', '3', '2']);
        expect(agruparYOrdenarMesas(mesas, 'personas').salon.mesas.map(x => x.id)).toEqual(['2', '1', '3']);
    });
    it('agrupa por plano y nunca supone verde para un estado desconocido', () => {
        const desconocida = mesa('4', 2, undefined, 'patio');
        expect(Object.keys(agruparYOrdenarMesas([mesa('1', 2, 'verde'), desconocida]))).toEqual(['salon', 'patio']);
        expect(estadoMesa(desconocida)).toBe('desconocida');
    });
});
