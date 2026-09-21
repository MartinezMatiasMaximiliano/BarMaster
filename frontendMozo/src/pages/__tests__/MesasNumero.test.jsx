import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMesaState } from '../../components/Mesa/useMesaState';
import visitasReducer, { eliminarProductos } from '../../redux/slices/visitasActivasSlice';

const { visitas } = vi.hoisted(() => ({ visitas: [
    { id: 'visita-a', idMesa: 'mesa-a', numeroMesa: 1, productosConsumidos: [{ id: 'producto-a' }] },
    { id: 'visita-b', idMesa: 'mesa-b', numeroMesa: 1, productosConsumidos: [{ id: 'producto-b' }] },
] }));
vi.mock('react-redux', () => ({ useSelector: selector => selector({ visitasActivas: { value: visitas } }) }));

describe('Identidad de mesas con el mismo número en distintos planos', () => {
    it('abre la visita de la mesa seleccionada por ID', () => {
        const { result } = renderHook(() => useMesaState('mesa-b'));
        expect(result.current.visitaMesa.id).toBe('visita-b');
    });

    it('cancela productos de la visita indicada por ID', () => {
        const resultado = visitasReducer({ value: visitas }, eliminarProductos({ idVisita: 'visita-b', idsProductos: ['producto-b'] }));
        expect(resultado.value[0].productosConsumidos).toEqual([{ id: 'producto-a' }]);
        expect(resultado.value[1].productosConsumidos).toEqual([]);
    });
});
