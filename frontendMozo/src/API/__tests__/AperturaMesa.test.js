import { beforeEach, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const { abrirCerrar, dispatch, navigate } = vi.hoisted(() => ({
    abrirCerrar: vi.fn(),
    dispatch: vi.fn(),
    navigate: vi.fn()
}));

vi.mock('react-redux', () => ({ useDispatch: () => dispatch }));
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));
vi.mock('../APIMesas', () => ({ AbrirCerrarMesa: abrirCerrar }));
vi.mock('../../connections/HubConnMozo', () => ({ sendHubMessage: vi.fn() }));

import { useMesaLogic } from '../../components/Mesa/useMesaLogic';

beforeEach(() => {
    vi.clearAllMocks();
});

it('devuelve la visita abierta para que el atajo pueda mostrar MesaModal', async () => {
    abrirCerrar.mockResolvedValue({
        id: 'visita-42',
        idMesa: 'mesa-42',
        idCaja: 'caja',
        idMozo: 'mozo',
        fechaHora: '2026-09-18T12:00:00Z',
        estado: 1
    });
    const { result } = renderHook(() => useMesaLogic());

    const visita = await result.current.abrirMesa({
        idMesa: 'mesa-42',
        numeroMesa: 42,
        codigoServicioMozo: '1234',
        abrir: true
    });

    expect(abrirCerrar).toHaveBeenCalledWith({
        IdMesa: 'mesa-42',
        CodigoServicioMozo: '1234',
        Abrir: true
    });
    expect(visita).toMatchObject({ id: 'visita-42', idMesa: 'mesa-42' });
    expect(dispatch).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledOnce();
});
