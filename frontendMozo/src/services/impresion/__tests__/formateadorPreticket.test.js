import { construirPreticketCrudo } from '../formateadorPreticket';
import { describe, expect, it } from 'vitest';

describe('construirPreticketCrudo', () => {
    it('imprime sólo productos impagos y agrupa líneas iguales', () => {
        const result = construirPreticketCrudo({
            nombreSucursal: 'Sucursal',
            nombreMesa: 'Mesa 4',
            impresoEn: new Date('2026-08-28T12:00:00Z'),
            productos: [
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

    it('rechaza un documento impago vacío', () => {
        expect(() => construirPreticketCrudo({ productos: [{ nombre: 'Té', pagado: true }] }))
            .toThrow('SIN_PRODUCTOS_IMPRIMIBLES');
    });
});
