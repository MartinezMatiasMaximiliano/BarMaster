import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const mocks = vi.hoisted(() => ({ impresoras: vi.fn(), reglas: vi.fn(), guardar: vi.fn(), eliminar: vi.fn() }));
vi.mock('../../../../services/impresion/apiImpresion', () => ({
    obtenerImpresoras: mocks.impresoras, obtenerReglasImpresion: mocks.reglas,
    guardarReglaImpresion: mocks.guardar, eliminarReglaImpresion: mocks.eliminar,
}));
vi.mock('../../../../services/impresion/erroresQz', () => ({ normalizarErrorQz: (error) => ({ mensaje: error.message }) }));
import ReglasImpresion from '../ReglasImpresion';

const impresoras = [
    { id: 'caja', nombreVisible: 'Caja', nombreEstacion: 'PC', habilitada: true, estacionEnLinea: true },
    { id: 'cocina', nombreVisible: 'Cocina', nombreEstacion: 'PC', habilitada: true, estacionEnLinea: true },
];
const regla = { id: 'r1', idImpresora: 'caja', nombreVisibleImpresora: 'Caja', nombreEstacion: 'PC', tipoSalida: 'Ticket', momento: 'AlGenerarPreticket', habilitada: false, compatible: true };
beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.impresoras.mockResolvedValue(impresoras);
    mocks.reglas.mockResolvedValue([]);
    mocks.guardar.mockImplementation(async (solicitud) => ({
        ...solicitud, id: solicitud.id || 'nueva', compatible: true,
        nombreVisibleImpresora: impresoras.find((p) => p.id === solicitud.idImpresora).nombreVisible,
    }));
});

it.each([
    ['Comandas', 'Comanda', 'AlCargarProductosMesa'],
    ['Cuenta previa', 'Ticket', 'AlGenerarPreticket'],
    ['Comprobante de pago', 'Ticket', 'AlCobrarProductosSinFacturar'],
])('asigna %s con el contrato correcto sin pedir tipo ni momento', async (titulo, tipoSalida, momento) => {
    render(<ReglasImpresion />);
    const seccion = await screen.findByRole('region', { name: titulo });
    fireEvent.mouseDown(within(seccion).getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'Caja — PC' }));
    await waitFor(() => expect(mocks.guardar).toHaveBeenCalledWith({ id: null, idImpresora: 'caja', tipoSalida, momento, habilitada: true }));
    expect(screen.queryByText('Qué se imprime')).not.toBeInTheDocument();
});

it('reactiva un destino existente y excluye esa impresora al agregar otro', async () => {
    mocks.reglas.mockResolvedValue([regla]);
    render(<ReglasImpresion bloqueadaPorCaja />);
    const seccion = await screen.findByRole('region', { name: 'Cuenta previa' });
    fireEvent.click(within(seccion).getByRole('switch'));
    await waitFor(() => expect(mocks.guardar).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1', habilitada: true })));
    await waitFor(() => expect(within(seccion).getByRole('switch')).toBeChecked());
    expect(within(seccion).getByRole('button', { name: 'Quitar' })).toBeDisabled();
    fireEvent.click(within(seccion).getByRole('button', { name: 'Agregar otra impresora' }));
    fireEvent.mouseDown(within(seccion).getAllByRole('combobox')[1]);
    const lista = await screen.findByRole('listbox');
    expect(within(lista).queryByRole('option', { name: 'Caja — PC' })).not.toBeInTheDocument();
    fireEvent.click(within(lista).getByRole('option', { name: 'Cocina — PC' }));
    await waitFor(() => expect(mocks.guardar).toHaveBeenLastCalledWith(expect.objectContaining({ id: null, idImpresora: 'cocina', momento: 'AlGenerarPreticket' })));
});

it('conserva el destino si falla su actualización', async () => {
    mocks.reglas.mockResolvedValue([regla]);
    mocks.guardar.mockRejectedValue(new Error('Sin conexión'));
    render(<ReglasImpresion />);
    const seccion = await screen.findByRole('region', { name: 'Cuenta previa' });
    fireEvent.click(within(seccion).getByRole('switch'));
    expect(await screen.findByText('Sin conexión')).toBeInTheDocument();
    expect(within(seccion).getByRole('switch')).not.toBeChecked();
});

it('ofrece una impresora recién guardada al actualizar el inventario sin remontar la pantalla', async () => {
    mocks.impresoras.mockResolvedValueOnce([]);
    const { rerender } = render(<ReglasImpresion versionImpresoras={0} />);
    const seccion = await screen.findByRole('region', { name: 'Cuenta previa' });
    expect(within(seccion).getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
    rerender(<ReglasImpresion versionImpresoras={1} />);
    await waitFor(() => expect(mocks.impresoras).toHaveBeenCalledTimes(2));
    const actualizada = await screen.findByRole('region', { name: 'Cuenta previa' });
    fireEvent.mouseDown(within(actualizada).getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'Caja — PC' }));
    await waitFor(() => expect(mocks.guardar).toHaveBeenCalledWith(expect.objectContaining({
        idImpresora: 'caja', momento: 'AlGenerarPreticket',
    })));
});
