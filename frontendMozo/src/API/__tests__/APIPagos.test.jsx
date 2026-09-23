import React from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
const { api } = vi.hoisted(() => ({ api: { post: vi.fn().mockResolvedValue({ data: { id: 'pago' } }) } }));
vi.mock('../../services/axiosInstance', () => ({ default: api }));
vi.mock('react-redux', () => ({ useSelector: (selector) => selector({ cajaActiva: { value: { montoActual: 1000 } } }) }));
vi.mock('../APITipoMovimientosCaja', () => ({ BuscarTipoMovimientosPorEntorno: vi.fn().mockResolvedValue([{ id: 2, nombre: 'Tarjeta', esEfectivo: false }]) }));
import { Pagar } from '../APIPagos';
import Modal from '../../components/Modals/Modal_Facturar/Modal_Facturar';
it('envía el descuento del modal al contrato de pago con otros medios', async () => {
    const confirmar = vi.fn((ids, medio, monto, descuento) => Pagar('visita', ids, medio, monto, descuento));
    render(<Modal open onClose={() => {}} total={100} productIds={[1]} currencyFormatter={new Intl.NumberFormat('es-AR')} onConfirm={confirmar} />);
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Tarjeta'));
    fireEvent.click(screen.getByText('Mostrar opciones extra'));
    fireEvent.change(screen.getByLabelText('Monto del descuento'), { target: { value: '20' } });
    fireEvent.click(screen.getByText('Confirmar cobro'));
    await waitFor(() => expect(confirmar).toHaveBeenCalledWith([1], 2, 80, 20));
    expect(api.post).toHaveBeenCalledWith('Pagar', expect.objectContaining({ montoAbonado: 80, descuentoDecimal: 20 }));
});

it('mantiene abierto el modal cuando el cobro no fue confirmado', async () => {
    const cerrar = vi.fn();
    const confirmar = vi.fn().mockResolvedValue(false);
    render(<Modal open onClose={cerrar} total={100} productIds={[1]} currencyFormatter={new Intl.NumberFormat('es-AR')} onConfirm={confirmar} />);
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Tarjeta'));

    fireEvent.click(screen.getByText('Confirmar cobro'));

    await waitFor(() => expect(confirmar).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('Confirmar cobro')).toBeEnabled());
    expect(cerrar).not.toHaveBeenCalled();
});
