import { buildPreticketRaw } from '../preticketFormatter';
import { describe, expect, it } from 'vitest';

describe('buildPreticketRaw', () => {
    it('prints only unpaid products and groups equal lines', () => {
        const result = buildPreticketRaw({
            branchName: 'Sucursal',
            tableName: 'Mesa 4',
            printedAt: new Date('2026-08-28T12:00:00Z'),
            products: [
                { nombre: 'Café', precioDelMomento: 100, indicaciones: 'corto' },
                { nombre: 'Café', precioDelMomento: 100, indicaciones: 'corto' },
                { nombre: 'Té', precioDelMomento: 200, pagado: true },
            ],
        });
        expect(result).toContain('2 x Café');
        expect(result).toContain('TOTAL $200,00');
        expect(result).not.toContain('Té');
        expect(result).toContain('DOCUMENTO NO VALIDO COMO FACTURA');
    });

    it('rejects an empty unpaid document', () => {
        expect(() => buildPreticketRaw({ products: [{ nombre: 'Té', pagado: true }] }))
            .toThrow('NO_PRINTABLE_PRODUCTS');
    });
});
