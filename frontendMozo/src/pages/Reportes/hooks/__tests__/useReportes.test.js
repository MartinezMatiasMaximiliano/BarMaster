import { describe, expect, it } from 'vitest';
import { calcularMargenGanancia } from '../../utils/metricasReporte';

describe('calcularMargenGanancia', () => {
    it('resta el costo de producción de las unidades vendidas', () => {
        const visitas = [{
            productos: [
                { idProducto: 'producto-1', nombreProducto: 'Café', cantidad: 2, precioTotal: 5000 },
                { idProducto: 'producto-2', nombreProducto: 'Tostado', cantidad: 1, precioTotal: 4500 },
            ],
        }];
        const productos = [
            { id: 'producto-1', nombre: 'Café renombrado', costoProduccion: 1200 },
            { id: 'producto-2', nombre: 'Tostado', costoProduccion: 2000 },
        ];

        expect(calcularMargenGanancia(visitas, productos)).toBe(5100);
    });

    it('mantiene compatibilidad con visitas sin id de producto', () => {
        const visitas = [{ productos: [{ nombreProducto: 'Café', cantidad: 1, precioTotal: 3000 }] }];
        const productos = [{ id: 'producto-1', nombre: 'Café', costoProduccion: 1000 }];

        expect(calcularMargenGanancia(visitas, productos)).toBe(2000);
    });
});
