import { describe, expect, it, vi } from 'vitest';
vi.mock('../apiImpresion', () => ({ fallarTrabajoImpresion: vi.fn().mockResolvedValue(),
    marcarTrabajoEnviando: vi.fn(), marcarTrabajoAceptado: vi.fn(), renovarReservaTrabajo: vi.fn(),
    reservarTrabajosImpresion: vi.fn(), asegurarSesionEstacion: vi.fn(), sincronizarInventarioImpresoras: vi.fn() }));
vi.mock('../impresionQz', () => ({ imprimirCrudo: vi.fn() }));
vi.mock('../impresorasQz', () => ({ requerirImpresora: vi.fn(), buscarImpresoras: vi.fn() }));
vi.mock('../conexionQz', () => ({ conectarQz: vi.fn(), obtenerVersionQz: vi.fn() }));
import { procesarTrabajo } from '../trabajadorImpresion';
import { fallarTrabajoImpresion, marcarTrabajoEnviando } from '../apiImpresion';
import { imprimirCrudo } from '../impresionQz';

describe('documentos inválidos en el trabajador', () => {
    it.each(['{}', 'null', '{', '{"lineas":[]}', JSON.stringify({ solicitadoEnUtc: '2026-09-11', lineas: [{ cantidad: -1, descripcion: 'Café' }] })])(
        'rechaza %s sin enviar ni reintentar', async (contenidoJson) => {
            await procesarTrabajo({ id: 'trabajo', idReserva: 'reserva', tipoDocumento: 'Preticket',
                versionEsquema: 1, versionPlantilla: 1, contenidoJson });
            expect(fallarTrabajoImpresion).toHaveBeenCalledWith('trabajo', expect.objectContaining({
                codigoError: 'DOCUMENTO_IMPRESION_INVALIDO', reintentable: false, ambiguo: false,
            }));
            expect(marcarTrabajoEnviando).not.toHaveBeenCalled();
            expect(imprimirCrudo).not.toHaveBeenCalled();
        });
});
