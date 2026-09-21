import { expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ObtenerTicket } from '../../../API/APITicket';
import TicketVirtual from '../TicketVirtual';

vi.mock('../../../API/APITicket', () => ({ ObtenerTicket: vi.fn() }));

it.each([0, 2500.5])('muestra el total cobrado %s y ambos nombres del comercio', async (montoTotal) => {
    ObtenerTicket.mockResolvedValue({
        nombreEmpresa: 'Empresa del Café', nombreSucursal: 'Centro',
        montoTotal, montoAbonado: 3000, vuelto: 499.5,
        productos: [{ nombre: 'Café', precio: 3000 }],
    });
    render(<MemoryRouter initialEntries={['/ticket/c/pago-id']}>
        <Routes><Route path="/ticket/:tenant/:id" element={<TicketVirtual />} /></Routes>
    </MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Empresa del Café' })).toBeInTheDocument();
    expect(screen.getByText('Sucursal: Centro')).toBeInTheDocument();
    const total = screen.getByText('Total').parentElement;
    expect(within(total).getByText(new Intl.NumberFormat('es-AR', {
        style: 'currency', currency: 'ARS', minimumFractionDigits: 2,
    }).format(montoTotal).replace(/\s/g, ' '))).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    expect(ObtenerTicket).toHaveBeenCalledWith('c', 'pago-id');
});
