import React from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
const { obtener } = vi.hoisted(() => ({ obtener: vi.fn() }));
vi.mock('../APIEmpresas', () => ({ ObtenerPlanEmpresa: obtener, ObtenerDatosEmpresa: vi.fn().mockResolvedValue({ nombre: 'Restaurante' }) }));
import MiPlan from '../../pages/Mi_Plan';
it('muestra precio cero y prestaciones sin fechas ni vencimiento supuesto', async () => {
    obtener.mockResolvedValue({ id: 1, nombre: 'Inicial', precio: 0, prestaciones: ['Mesas'] });
    render(<MiPlan />);
    expect(await screen.findByText('Inicial')).toBeInTheDocument();
    expect(screen.getByText('Mesas')).toBeInTheDocument();
    expect(screen.getByText(/Precio:/)).toHaveTextContent('0,00');
    expect(screen.queryByText(/Vencido|Fecha de/)).not.toBeInTheDocument();
});
it('indica cuando no hay suscripción', async () => {
    obtener.mockResolvedValue('');
    render(<MiPlan />);
    expect(await screen.findByText(/no tiene una suscripción/)).toBeInTheDocument();
});
