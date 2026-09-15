import { it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
const { pagar, dispatch, send } = vi.hoisted(() => ({ pagar: vi.fn().mockResolvedValue({ id: 'movimiento' }), dispatch: vi.fn(), send: vi.fn().mockResolvedValue(false) }));
vi.mock('react-redux', () => ({ useDispatch: () => dispatch, shallowEqual: () => true, useSelector: selector => selector({ visitasActivas: { value: [{ id: 'visita', numeroMesa: '1', productosConsumidos: [{ id: 2, precio: 100, estadoPagado: false }] }] } }) }));
vi.mock('../APIPagos', () => ({ Pagar: pagar }));
vi.mock('../APITipoMovimientosCaja', () => ({ BuscarTipoMovimientosPorEntorno: vi.fn() }));
vi.mock('../../connections/HubConnMozo', () => ({ sendHubMessage: send }));
import { useModalVerCuenta } from '../../components/Modals/Modal_Ver_Cuenta/hooks/useModalVerCuenta';
it('cobro exitoso actualiza la cuenta sin PDF aunque SignalR esté desconectado', async () => {
    const { result } = renderHook(() => useModalVerCuenta({ nombre: '1' }));
    const aviso = vi.fn();
    await act(() => result.current.PagarMesa([2], aviso, { idTipoPago: 1, monto: 100, descuento: 20 }));
    expect(pagar).toHaveBeenCalledWith('visita', [2], 1, 100, 20);
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { idsProductos: [2], pagado: true, idMovimientoCaja: 'movimiento' } }));
    expect(result.current.tabValue).toBe(2);
    expect(aviso).toHaveBeenCalledWith(expect.any(String), 'success');
});
