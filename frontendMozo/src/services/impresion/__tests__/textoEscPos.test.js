import { describe, expect, it } from 'vitest';
import { limpiarTextoEscPos } from '../textoEscPos';
import { formatearTrabajoCrudo } from '../formateadoresTrabajos';
import { construirPreticketCrudo } from '../formateadorPreticket';

const malicioso = 'Café\x1dV\x00\x1b@\x10\x04\x01\x7f\x9b\tniño\r\nSin sal';
const limpio = 'CaféV@ niño\nSin sal';
const controles = (texto) => [...texto].filter((c) => /\p{Cc}/u.test(c) && c !== '\n').join('');

describe('texto ESC/POS', () => {
    it('conserva acentos y saltos, convierte tabulaciones y elimina controles C0/C1', () => {
        expect(limpiarTextoEscPos(malicioso)).toBe(limpio);
    });

    it.each(['Preticket', 'Comanda'])('impide comandos en todos los campos de %s', (tipoDocumento) => {
        const crear = (texto) => formatearTrabajoCrudo({
            tipoDocumento, versionEsquema: 1, versionPlantilla: 1, anchoPapelMm: 80,
            contenidoJson: JSON.stringify({ nombreSucursal: texto, nombreMesa: texto, areaProduccion: texto,
                solicitadoEnUtc: '2026-09-03T18:00:00Z', lineas: [{ cantidad: 1, descripcion: texto, notas: texto, precioUnitario: 100 }] }),
        });
        const resultado = crear(malicioso);
        expect(resultado).toBe(crear(limpio));
        expect(controles(resultado)).toBe(controles(crear('normal')));
        expect(resultado.split('\x1dV\x00')).toHaveLength(2);
    });

    it('protege también el preticket local', () => {
        const crear = (texto) => construirPreticketCrudo({ nombreSucursal: texto, nombreMesa: texto,
            impresoEn: new Date('2026-09-03'), productos: [{ nombre: texto, indicaciones: texto, precio: 1 }] });
        expect(crear(malicioso)).toBe(crear(limpio));
    });
});
