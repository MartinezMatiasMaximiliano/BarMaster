import { beforeEach, describe, expect, it, vi } from 'vitest';

const qzMock = {
    configs: { create: vi.fn(() => ({ printer: 'KP-1025' })) },
    print: vi.fn(() => Promise.resolve()),
};
const requerirImpresora = vi.fn(() => Promise.resolve());

vi.mock('../clienteQz', () => ({ default: qzMock }));
vi.mock('../impresorasQz', () => ({ requerirImpresora }));

describe('impresionQz', () => {
    beforeEach(() => vi.clearAllMocks());

    it('siempre envía ESC/POS como un comando crudo y respeta el contrato de QZ', async () => {
        const { imprimirCrudo } = await import('../impresionQz');
        const escPos = '\x1B\x40TICKET\n\x1D\x56\x00';

        await imprimirCrudo('KP-1025', escPos, { copias: 2, codificacion: 'CP858', nombreTrabajo: 'Prueba' });

        expect(qzMock.configs.create).toHaveBeenCalledWith('KP-1025', {
            copies: 2,
            encoding: 'CP858',
            jobName: 'Prueba',
        });

        expect(qzMock.print).toHaveBeenCalledWith(
            { printer: 'KP-1025' },
            [{ type: 'raw', format: 'command', flavor: 'plain', data: '\x1B\x40\x1Bt\x13TICKET\n\x1D\x56\x00' }],
        );
    });

    it.each([
        ['CP437', 0],
        ['CP850', 2],
        ['Windows-1252', 16],
        ['CP858', 19],
    ])('selecciona la tabla ESC/POS correspondiente a %s', async (codificacion, pagina) => {
        const { seleccionarPaginaCaracteres } = await import('../impresionQz');

        expect(seleccionarPaginaCaracteres('\x1B@Café, pingüino y ñandú', codificacion))
            .toBe(`\x1B@\x1Bt${String.fromCharCode(pagina)}Café, pingüino y ñandú`);
    });
});
