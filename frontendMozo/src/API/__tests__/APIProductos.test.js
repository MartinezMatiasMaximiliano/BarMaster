import { beforeEach, describe, expect, it, vi } from 'vitest';

const { post, sendHubMessage } = vi.hoisted(() => ({
    post: vi.fn(),
    sendHubMessage: vi.fn(),
}));

vi.mock('../../services/axiosInstance', () => ({ default: { post } }));
vi.mock('../../connections/HubConnMozo', () => ({ sendHubMessage }));

import { CrearProducto } from '../APIProductos';

describe('CrearProducto', () => {
    beforeEach(() => {
        post.mockResolvedValue({ data: {} });
        sendHubMessage.mockResolvedValue(undefined);
    });

    it('envía la configuración de alerta al crear el stock del producto', async () => {
        await CrearProducto({
            nombre: 'Café',
            precio: '19000',
            categorias: [],
            controlaStock: true,
            enviarAlerta: true,
            cantidadMinima: 5,
            cantidadInicial: 10,
        });

        expect(post).toHaveBeenCalledWith(
            'Productos/',
            expect.objectContaining({
                PrecioNeto: 19000,
                ControlaStock: true,
                EnviarAlerta: true,
                CantidadMinima: 5,
                CantidadInicial: 10,
            }),
            expect.any(Object),
        );
    });

    it('no activa alertas si el producto no controla stock', async () => {
        await CrearProducto({
            nombre: 'Café',
            precio: 19000,
            categorias: [],
            controlaStock: false,
            enviarAlerta: true,
        });

        expect(post.mock.calls[0][1]).toEqual(expect.objectContaining({
            ControlaStock: false,
            EnviarAlerta: false,
        }));
    });
});
