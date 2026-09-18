import { describe, expect, it } from 'vitest';
import { formatearTrabajoCrudo } from '../formateadoresTrabajos';

describe('formatearTrabajoCrudo', () => {
    it.each([58, 80])('incluye datos del comercio y desglose en papel de %s mm', (anchoPapelMm) => {
        const salida = formatearTrabajoCrudo({
            tipoDocumento: 'ComprobantePago', versionEsquema: 1, versionPlantilla: 1, anchoPapelMm,
            contenidoJson: JSON.stringify({
                nombreEmpresa: 'Café Empresa', nombreSucursal: 'Centro', cuit: '30123456789',
                direccion: 'Una avenida con un nombre muy largo 1234, Buenos Aires', telefono: '1145678901',
                email: 'contacto@cafe.test', referenciaPago: 'c48bcd65-ed6d-49c1-81bb-a6128664eb36', medioPago: 'Tarjeta',
                nombreMesa: '4', origen: 'Local', solicitadoEnUtc: '2026-09-14T15:00:00Z',
                lineas: [{ cantidad: 1, descripcion: 'Café', precioUnitario: 100 }],
                subtotal: 100, descuento: 10, recargo: 5, ajustePedido: 0, total: 95, montoAbonado: 100, vuelto: 5,
            }),
        });
        for (const texto of ['Café Empresa', 'Sucursal: Centro', 'CUIT: 30-12345678-9', 'Tel.: 1145678901',
            'Email: contacto@cafe.test', 'Medio de pago: Tarjeta', 'SUBTOTAL $100,00', 'DESCUENTO -$10,00',
            'RECARGO $5,00', 'TOTAL $95,00', 'NO FISCAL', 'Gracias por su visita'])
            expect(salida).toContain(texto);
        const imprimible = salida.replace(/\x1b[@aE][\x00-\x02]?|\x1dV\x00/g, '');
        expect(imprimible.split('\n').every((linea) => linea.length <= (anchoPapelMm === 58 ? 32 : 48))).toBe(true);
        expect(salida).not.toContain('undefined');
        expect(salida).not.toContain('Referencia de pago');
        expect(salida).toContain('ID del pago:');
        expect(salida.replace(/\n/g, '')).toContain('c48bcd65-ed6d-49c1-81bb-a6128664eb36');
    });

    it('formatea un comprobante al cobrar productos', () => {
        const salida = formatearTrabajoCrudo({
            tipoDocumento: 'ComprobantePago', versionEsquema: 1, versionPlantilla: 1, anchoPapelMm: 80,
            contenidoJson: JSON.stringify({ nombreSucursal: 'BarMaster', nombreMesa: '4', solicitadoEnUtc: '2026-09-14T12:00:00Z',
                lineas: [{ cantidad: 2, descripcion: 'Café', precioUnitario: 1500, notas: null }],
                total: 3000, montoAbonado: 5000, vuelto: 2000 }),
        });
        expect(salida).toContain('COMPROBANTE DE PAGO');
        expect(salida).toContain('TOTAL $3.000,00');
        expect(salida).toContain('VUELTO $2.000,00');
    });
    it('formatea la instantánea del preticket sin confiar en totales del navegador', () => {
        const output = formatearTrabajoCrudo({
            tipoDocumento: 'Preticket', versionEsquema: 1, versionPlantilla: 1, anchoPapelMm: 58,
            contenidoJson: JSON.stringify({ nombreSucursal: 'Centro', nombreMesa: 'Mesa 4', solicitadoEnUtc: '2026-09-03T18:00:00Z', lineas: [{ cantidad: 2, descripcion: 'Café', precioUnitario: 100, notas: null }], total: 200 }),
        });
        expect(output).toMatch(/2\s*x Café/);
        expect(output).toContain('TOTAL $200,00');
    });

    it('no incluye precios en comandas de cocina', () => {
        const output = formatearTrabajoCrudo({
            tipoDocumento: 'Comanda', versionEsquema: 1, versionPlantilla: 1, anchoPapelMm: 80,
            contenidoJson: JSON.stringify({ nombreSucursal: 'Centro', nombreMesa: 'Mesa 4', areaProduccion: 'Cocina', solicitadoEnUtc: '2026-09-03T18:00:00Z', lineas: [{ cantidad: 1, descripcion: 'Milanesa', notas: 'Sin sal' }] }),
        });
        expect(output).toContain('COMANDA - Cocina');
        expect(output).toContain('NOTA: Sin sal');
        expect(output).not.toContain('$');
    });
});
