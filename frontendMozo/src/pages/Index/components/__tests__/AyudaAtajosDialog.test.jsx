import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AyudaAtajosDialog } from '../AyudaAtajosDialog';

afterEach(cleanup);

describe('Ayuda de atajos de mesas', () => {
    it('muestra los atajos y las ayudas de escritura automática', () => {
        render(<AyudaAtajosDialog open onClose={() => {}} />);

        expect(screen.getByText('Abrir una mesa')).toBeInTheDocument();
        expect(screen.getByText('Sumar una unidad')).toBeInTheDocument();
        expect(screen.getByText('Quitar una unidad')).toBeInTheDocument();
        expect(screen.getByText(/simplemente empezá a escribirlo/i)).toBeInTheDocument();
        expect(screen.getByText(/empezá a escribir el nombre del producto/i)).toBeInTheDocument();
    });

    it('permite cerrar la ayuda desde Entendido', () => {
        const cerrar = vi.fn();
        render(<AyudaAtajosDialog open onClose={cerrar} />);

        fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
        expect(cerrar).toHaveBeenCalledOnce();
    });
});
