import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import BuscadorDisponibilidad from '../../components/Reservas/BuscadorDisponibilidad';
import { BuscarMesasDisponibles, CrearReserva } from '../../API/APIReservas';
vi.mock('../../API/APIReservas', () => ({ BuscarMesasDisponibles: vi.fn(), CrearReserva: vi.fn() }));
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());
const mesa = { id: 'mesa-1', numero: 1, capacidad: 4, plano: { id: 'salon', nombre: 'Salón' }, estadoDisponibilidad: 'verde' };
async function buscar() {
    fireEvent.change(screen.getByLabelText(/Día/), { target: { value: '2099-09-16' } });
    fireEvent.change(screen.getByLabelText(/^Hora/), { target: { value: '20:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar mesas' }));
    fireEvent.click(await screen.findByRole('button', { name: /Mesa 1/ }));
    fireEvent.change(screen.getByLabelText(/Nombre de reserva/), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '1155551234' } });
    fireEvent.change(screen.getByLabelText(/Cantidad de personas/), { target: { value: '3' } });
}
describe('Reservar desde disponibilidad', () => {
    it('permite limpiar los resultados conservando los filtros', async () => {
        BuscarMesasDisponibles.mockResolvedValue([mesa]);
        render(<BuscadorDisponibilidad />);
        fireEvent.click(screen.getByRole('button', { name: 'Buscar mesas' }));
        await screen.findByRole('button', { name: /Mesa 1/ });
        const dia = screen.getByLabelText(/Día/).value;
        const hora = screen.getByLabelText(/^Hora/).value;

        fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda de disponibilidad' }));

        expect(screen.queryByRole('region', { name: 'Mesas disponibles' })).toBeNull();
        expect(screen.getByLabelText(/Día/).value).toBe(dia);
        expect(screen.getByLabelText(/^Hora/).value).toBe(hora);
    });
    it('agrupa las mesas en columnas por plano', async () => {
        BuscarMesasDisponibles.mockResolvedValue([mesa,
            { ...mesa, id: 'mesa-2', numero: 2, plano: { id: 'patio', nombre: 'Patio' }, estadoDisponibilidad: 'roja' }]);
        render(<BuscadorDisponibilidad />);
        fireEvent.click(screen.getByRole('button', { name: 'Buscar mesas' }));
        expect(await screen.findByRole('heading', { name: 'Salón' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Patio' })).toBeTruthy();
        expect(screen.getByRole('button', { name: /Mesa 2.*disponibilidad roja/ })).toBeTruthy();
    });
    it('ordena dentro del plano por capacidad en ambas direcciones', async () => {
        BuscarMesasDisponibles.mockResolvedValue([
            { ...mesa, id: 'mesa-1', numero: 1, capacidad: 6 },
            { ...mesa, id: 'mesa-2', numero: 2, capacidad: 2, estadoDisponibilidad: 'roja' },
        ]);
        render(<BuscadorDisponibilidad />);
        fireEvent.click(screen.getByRole('button', { name: 'Buscar mesas' }));
        await screen.findByRole('heading', { name: 'Salón' });

        fireEvent.mouseDown(screen.getByLabelText('Ordenar por'));
        fireEvent.click(screen.getByRole('option', { name: 'Cantidad de personas' }));
        let botones = within(screen.getByRole('region', { name: 'Mesas disponibles' })).getAllByRole('button');
        expect(botones.map(boton => boton.getAttribute('aria-label'))).toEqual([
            expect.stringContaining('Mesa 2'), expect.stringContaining('Mesa 1'),
        ]);

        fireEvent.click(screen.getByRole('button', { name: 'Dirección ascendente' }));
        expect(screen.getByRole('button', { name: 'Dirección descendente' })).toBeTruthy();
        botones = within(screen.getByRole('region', { name: 'Mesas disponibles' })).getAllByRole('button');
        expect(botones.map(boton => boton.getAttribute('aria-label'))).toEqual([
            expect.stringContaining('Mesa 1'), expect.stringContaining('Mesa 2'),
        ]);
    });
    it('impide consultar días anteriores al actual', async () => {
        BuscarMesasDisponibles.mockResolvedValue([mesa]);
        render(<BuscadorDisponibilidad />);
        const dia = screen.getByLabelText(/Día/);
        expect(dia.getAttribute('min')).toBeTruthy();
        fireEvent.change(dia, { target: { value: '2020-09-16' } });
        fireEvent.change(screen.getByLabelText(/^Hora/), { target: { value: '20:30' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Buscar mesas' }).closest('form'));
        expect(await screen.findByText('No se puede buscar disponibilidad de días anteriores.')).toBeTruthy();
        expect(BuscarMesasDisponibles).not.toHaveBeenCalled();
        expect(CrearReserva).not.toHaveBeenCalled();
    });
    it('permite consultar el día actual aunque la hora ya haya pasado', async () => {
        BuscarMesasDisponibles.mockResolvedValue([mesa]);
        render(<BuscadorDisponibilidad />);
        fireEvent.change(screen.getByLabelText(/^Hora/), { target: { value: '00:00' } });
        fireEvent.click(screen.getByRole('button', { name: 'Buscar mesas' }));
        expect(await screen.findByText(/Consulta de una fecha pasada/)).toBeTruthy();
        expect(BuscarMesasDisponibles).toHaveBeenCalledOnce();
    });
    it('confirma con mesa, fecha y datos del modal y actualiza la agenda', async () => {
        BuscarMesasDisponibles.mockResolvedValue([mesa]);
        CrearReserva.mockResolvedValue({ id: 'reserva-1' });
        const recargar = vi.fn();
        render(<BuscadorDisponibilidad onReservaCreada={recargar} />);
        await buscar();
        fireEvent.click(screen.getByRole('button', { name: 'Confirmar reserva' }));
        await screen.findByText('Reserva confirmada.');
        expect(CrearReserva).toHaveBeenCalledWith({ idMesa: mesa.id,
            fechaHora: new Date('2099-09-16T20:30').toISOString(), nombreReserva: 'Ana',
            telefono: '1155551234', cantidadDePersonas: 3, IdEstadoReserva: 2 });
        expect(recargar).toHaveBeenCalledOnce();
        expect(screen.queryByRole('button', { name: /Mesa 1/ })).toBeNull();
    });
    it('impide confirmar si otra reserva ocupó la mesa durante la carga del formulario', async () => {
        BuscarMesasDisponibles.mockResolvedValueOnce([mesa]).mockResolvedValueOnce([]);
        render(<BuscadorDisponibilidad />);
        await buscar();
        fireEvent.click(screen.getByRole('button', { name: 'Confirmar reserva' }));
        await screen.findByText(/Esta mesa ya no está disponible/);
        expect(CrearReserva).not.toHaveBeenCalled();
    });
    it('conserva los datos del formulario cuando falla el POST', async () => {
        BuscarMesasDisponibles.mockResolvedValue([mesa]);
        CrearReserva.mockRejectedValue(new Error('Error al guardar'));
        render(<BuscadorDisponibilidad />);
        await buscar();
        fireEvent.click(screen.getByRole('button', { name: 'Confirmar reserva' }));
        await screen.findByText('Error al guardar');
        expect(screen.getByLabelText(/Nombre de reserva/).value).toBe('Ana');
        await waitFor(() => expect(screen.getByRole('button', { name: 'Confirmar reserva' }).disabled).toBe(false));
    });
});
