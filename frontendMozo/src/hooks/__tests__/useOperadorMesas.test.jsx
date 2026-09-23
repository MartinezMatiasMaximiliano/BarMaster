import { renderHook } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import codigoMozoReducer from '../../redux/slices/codigoMozoSlice';
import mozoReducer from '../../redux/slices/mozoSlice';
import { useOperadorMesas } from '../useOperadorMesas';

const token = (payload) => `x.${btoa(JSON.stringify(payload))}.x`;
const wrapper = ({ children }) => <Provider store={configureStore({ reducer: {
    codigoMozo: codigoMozoReducer, mozo: mozoReducer,
} })}>{children}</Provider>;

describe('useOperadorMesas', () => {
    afterEach(() => localStorage.clear());

    it.each([1, 4])('selecciona automáticamente al rol %s con acceso global', (idRol) => {
        localStorage.setItem('USER_token', token({ IdPersona: 'persona-1', IdRol: idRol }));
        localStorage.setItem('USER_codigo_servicio', '8421');
        const { result } = renderHook(() => useOperadorMesas([]), { wrapper });
        expect(result.current).toMatchObject({ accesoGlobal: true, esAutomatico: true,
            codigoMozo: '8421', mozo: { id: 'persona-1', codigoDeServicio: '8421' } });
    });

    it('mantiene la selección por código para roles sin acceso global', () => {
        localStorage.setItem('USER_token', token({ IdPersona: 'persona-1', IdRol: 3 }));
        const { result } = renderHook(() => useOperadorMesas([]), { wrapper });
        expect(result.current.accesoGlobal).toBe(false);
        expect(result.current.esAutomatico).toBe(false);
    });
});
