import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EstadoReservaChip from './EstadoReservaChip';

describe('EstadoReservaChip', () => {
    it('cambia Confirmada a Cancelada y espera la persistencia', async () => {
        let confirmar;
        const guardar = vi.fn(() => new Promise(resolve => { confirmar = resolve; }));
        render(<EstadoReservaChip estado="Confirmada" idEstado={2} onCambiar={guardar} />);
        fireEvent.click(screen.getByRole('button', { name: 'Confirmada. Cambiar a Cancelada' }));
        expect(guardar).toHaveBeenCalledWith(3);
        expect(screen.getByText('Guardando…')).toBeTruthy();
        confirmar();
        await waitFor(() => expect(screen.getByText('Confirmada')).toBeTruthy());
    });

    it('cambia Cancelada a Confirmada e informa errores', async () => {
        const informar = vi.fn();
        const guardar = vi.fn().mockRejectedValue(new Error('Sin conexión'));
        render(<EstadoReservaChip estado="Cancelada" idEstado={3} onCambiar={guardar} onError={informar} />);
        fireEvent.click(screen.getByRole('button', { name: 'Cancelada. Cambiar a Confirmada' }));
        await waitFor(() => expect(informar).toHaveBeenCalledWith('Sin conexión'));
        expect(guardar).toHaveBeenCalledWith(2);
    });
});
