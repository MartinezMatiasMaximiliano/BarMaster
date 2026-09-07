import { describe, expect, it } from 'vitest';
import { formatearTrabajoCrudo } from '../formateadoresTrabajos';

describe('formatearTrabajoCrudo', () => {
    it('formatea la instantánea del preticket sin confiar en totales del navegador', () => {
        const output = formatearTrabajoCrudo({
            tipoDocumento: 'Preticket', versionEsquema: 1, versionPlantilla: 1, anchoPapelMm: 58,
            contenidoJson: JSON.stringify({ nombreSucursal: 'Centro', nombreMesa: 'Mesa 4', solicitadoEnUtc: '2026-09-03T18:00:00Z', lineas: [{ cantidad: 2, descripcion: 'Café', precioUnitario: 100, notas: null }], total: 200 }),
        });
        expect(output).toContain('2 x Café');
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
