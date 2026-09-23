import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import codigoMozoReducer from '../../../../redux/slices/codigoMozoSlice';
import mozoReducer from '../../../../redux/slices/mozoSlice';

const { validar } = vi.hoisted(() => ({ validar: vi.fn() }));
vi.mock('../../../../API/APIPersonas', () => ({ ValidarCodigoMozo: validar }));

import { useMozoCode } from '../useMozoCode';

describe('validación remota del código de mozo', () => {
    beforeEach(() => validar.mockReset());

    it('selecciona el mozo sin descargar ni recibir su código de servicio', async () => {
        validar.mockResolvedValue({ id: 'mozo-1', nombres: 'Ana', apellido: 'Pérez', personajeId: 2 });
        const store = configureStore({
            reducer: { codigoMozo: codigoMozoReducer, mozo: mozoReducer },
            preloadedState: { codigoMozo: { value: '1111' }, mozo: { value: undefined } },
        });
        const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

        const { result } = renderHook(() => useMozoCode(), { wrapper });

        await waitFor(() => expect(result.current.mozo?.id).toBe('mozo-1'));
        expect(validar).toHaveBeenCalledWith('1111');
        expect(result.current.mozo).toMatchObject({ nombre: 'Ana', codigoDeServicio: '1111' });
    });

    it('no consulta códigos incompletos', () => {
        const store = configureStore({
            reducer: { codigoMozo: codigoMozoReducer, mozo: mozoReducer },
            preloadedState: { codigoMozo: { value: '111' }, mozo: { value: undefined } },
        });
        const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

        renderHook(() => useMozoCode(), { wrapper });
        expect(validar).not.toHaveBeenCalled();
    });
});
