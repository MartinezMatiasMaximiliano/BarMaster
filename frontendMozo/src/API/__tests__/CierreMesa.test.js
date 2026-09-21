import { it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
const { cerrar, dispatch, navigate, send } = vi.hoisted(() => ({ cerrar: vi.fn(), dispatch: vi.fn(), navigate: vi.fn(), send: vi.fn() }));
vi.mock('react-redux', () => ({ useDispatch: () => dispatch }));
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));
vi.mock('../APIMesas', () => ({ AbrirCerrarMesa: cerrar }));
vi.mock('../../connections/HubConnMozo', () => ({ sendHubMessage: send }));
import { useMesaLogic } from '../../components/Mesa/useMesaLogic';
it('rechazo de cierre se muestra sin marcar pagos ni anunciar mesa cerrada', async () => {
    cerrar.mockRejectedValue(new Error('No se puede cerrar la visita, hay productos no pagados'));
    const aviso = vi.fn();
    const { result } = renderHook(() => useMesaLogic(aviso));
    await result.current.cerrarMesa('mesa', '1', [{ id: 2, estadoPagado: false }]);
    expect(cerrar).toHaveBeenCalledWith({ IdMesa: 'mesa', Abrir: false });
    expect(dispatch).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(aviso).toHaveBeenCalledWith('No se puede cerrar la visita, hay productos no pagados', 'error');
});
