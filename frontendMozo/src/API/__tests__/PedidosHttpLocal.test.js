import { afterEach, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { webcrypto } from 'node:crypto';

const { post, dispatch } = vi.hoisted(() => ({ post: vi.fn(), dispatch: vi.fn() }));
vi.mock('../../services/axiosInstance', () => ({ default: { post } }));
vi.mock('react-redux', () => ({ useDispatch: () => dispatch }));
vi.mock('../../connections/HubConnMozo', () => ({ sendHubMessage: vi.fn() }));
vi.mock('../../hooks/useSnackbar.jsx', () => ({
    useSnackbar: () => ({ showSnackbar: vi.fn(), closeSnackbar: vi.fn() }),
}));
import { useAgregarPedidos } from '../../components/Modals/Agregar_Pedidos/hooks/useAgregarPedidos';
import { AgregarProductosAVisita } from '../APIVisitas';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
});

it('envía productos por HTTP y reutiliza idComando al reintentar un envío fallido', async () => {
    vi.stubGlobal('crypto', { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    post.mockRejectedValueOnce(new Error('Conexión interrumpida'))
        .mockResolvedValueOnce({ data: { id: 'visita' } });
    const cerrar = vi.fn();
    const { result } = renderHook(() => useAgregarPedidos(false, 'visita', 1, cerrar));
    act(() => result.current.agregarAComanda({ id: 'producto', precio: 100 }));
    await act(() => result.current.handleEnviarPedidos());
    expect(cerrar).not.toHaveBeenCalled();
    await act(() => result.current.handleEnviarPedidos());
    expect(post).toHaveBeenCalledTimes(2);
    const [url, productos] = post.mock.calls[0];
    expect(url).toMatch(/idComando=[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(productos).toEqual([{ idProducto: 'producto', detalles: '', cantidad: 1 }]);
    expect(post.mock.calls[1][0]).toBe(url);
    expect(cerrar).toHaveBeenCalledOnce();
    expect(result.current.comanda).toEqual([]);
});

it('genera idComando también para llamadas directas a la API sin randomUUID', async () => {
    vi.stubGlobal('crypto', { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) });
    post.mockResolvedValue({ data: { id: 'visita' } });
    await AgregarProductosAVisita('visita', []);
    expect(post.mock.calls[0][0]).toMatch(/idComando=[0-9a-f-]{36}$/);
});
