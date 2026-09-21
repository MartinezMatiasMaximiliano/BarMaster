import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ModalEditar from '../Modal_Editar';

afterEach(cleanup);

const campos = [
    { name: 'nombre', label: 'Nombre', type: 'text' },
    { name: 'controlaStock', label: 'Controlar stock de este producto', type: 'checkbox' },
    {
        name: 'enviarAlerta',
        label: 'Mostrar alerta de stock bajo en el inicio',
        type: 'checkbox',
        visibleWhen: (values) => Boolean(values.controlaStock),
    },
    {
        name: 'cantidadMinima',
        label: 'Cantidad mínima',
        type: 'number',
        visibleWhen: (values) => Boolean(values.controlaStock),
    },
];

describe('campos booleanos al editar', () => {
    it('usa switches y oculta la configuración dependiente si no controla stock', async () => {
        const modificar = vi.fn().mockResolvedValue({});

        render(
            <ModalEditar
                show
                onClose={vi.fn()}
                fila={{ id: 'producto-1', nombre: 'Café', controlaStock: false }}
                campos={campos}
                modificar={modificar}
                recargarComponentes={vi.fn()}
            />,
        );

        const controlaStock = screen.getByRole('switch', { name: 'Controlar stock de este producto' });
        expect(controlaStock.checked).toBe(false);
        expect(screen.queryByRole('switch', { name: 'Mostrar alerta de stock bajo en el inicio' })).toBeNull();
        expect(screen.queryByLabelText('Cantidad mínima')).toBeNull();

        fireEvent.click(controlaStock);

        expect(screen.getByRole('switch', { name: 'Mostrar alerta de stock bajo en el inicio' })).toBeTruthy();
        expect(screen.getByLabelText('Cantidad mínima')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));
        await waitFor(() => expect(modificar).toHaveBeenCalledWith(expect.objectContaining({
            id: 'producto-1',
            controlaStock: true,
        })));
    });
});
