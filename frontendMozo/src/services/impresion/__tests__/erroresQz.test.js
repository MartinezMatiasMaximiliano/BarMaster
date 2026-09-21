import { describe, expect, it } from 'vitest';
import { normalizarErrorQz } from '../erroresQz';

describe('normalizarErrorQz', () => {
    it('no informa un fallo de autorización como un fallo de conexión local', () => {
        const result = normalizarErrorQz({ response: { status: 403 } });

        expect(result.codigo).toBe('CONFIGURACION_IMPRESION_PROHIBIDA');
        expect(result.mensaje).toContain('permiso');
        expect(result.mensaje).not.toContain('servicio de impresión');
    });

    it('usa el mensaje estructurado del backend cuando está disponible', () => {
        const result = normalizarErrorQz({
            response: { status: 400, data: { error: { codigo: 'PERSONALIZADO', mensaje: 'Mensaje del servidor' } } },
        });

        expect(result).toMatchObject({ codigo: 'PERSONALIZADO', mensaje: 'Mensaje del servidor' });
    });
});
