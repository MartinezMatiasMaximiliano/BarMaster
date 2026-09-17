import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../services/axiosInstance';
import { CrearMesa, ModificarMesa } from '../APIMesas';

vi.mock('../../services/axiosInstance', () => ({ default: { post: vi.fn(), patch: vi.fn() } }));
beforeEach(() => {
    vi.resetAllMocks();
    api.post.mockResolvedValue({ data: {} });
    api.patch.mockResolvedValue({ data: {} });
});

describe('Contrato numérico de mesas', () => {
    it('envía un entero al crear desde el formulario', async () => {
        await CrearMesa({ numero: '07', idPlano: 'plano', capacidad: '4' });
        const body = api.post.mock.calls[0][1];
        expect(body.Numero).toBe(7);
        expect(body).not.toHaveProperty('Nombre');
    });

    it('envía el número editado y lo omite al mover una mesa', async () => {
        await ModificarMesa({ id: 'mesa', numero: '12' });
        expect(api.patch).toHaveBeenLastCalledWith('Mesa', { Id: 'mesa', Numero: 12 });
        await ModificarMesa({ id: 'mesa', x: 2, y: 3 });
        expect(api.patch).toHaveBeenLastCalledWith('Mesa', { Id: 'mesa', x: 2, y: 3 });
    });
});
