import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ModalEditar from '../../components/Modals/Editar_ABM/Modal_Editar';
import { camposConMesas } from '../../configs/agregar/Reservas';
import { MappearReservas } from '../../Helpers/HelperFunctions';
import Reservas from '../Abm_Reservas';
import { claveDia } from '../../Helpers/fechasReservas';

const Campos = camposConMesas([{ id: 'mesa-7', numero: 7 }, { id: 'mesa-12', numero: 12 }]);

afterEach(cleanup);

describe('Mesa reservada', () => {
    it.each([['Mesa 12', 'mesa-12'], ['Sin asignar', '']])('precarga la mesa del GET y permite guardar %s', async (nombreMesa, nuevaMesa) => {
        const fila = MappearReservas([{ id: 'reserva-1', fechaHora: '2026-12-20T22:00:00Z',
            nombreReserva: 'Ana García', telefonoContacto: '1155551234', cantidadDePersonas: 4,
            idMesa: 'mesa-7', mesaReserva: '7', estado: { id: 2, nombre: 'Confirmada' } }])[0];
        const modificar = vi.fn().mockResolvedValue({});
        render(<ModalEditar show onClose={vi.fn()} fila={fila} campos={Campos}
            modificar={modificar} recargarComponentes={vi.fn()} />);
        const campo = screen.getByLabelText('Mesa reservada');
        expect(campo.textContent).toBe('Mesa 7');
        fireEvent.mouseDown(campo);
        fireEvent.click(screen.getByRole('option', { name: nombreMesa }));
        fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
        await waitFor(() => expect(modificar).toHaveBeenCalledWith(expect.objectContaining({
            id: 'reserva-1', idMesa: nuevaMesa, cantidadDePersonas: 4,
        })));
    });
});

describe('Calendario de reservas', () => {
    it('selecciona días y ordena reservas por hora local', () => {
        const hoy = new Date();
        const dia = claveDia(hoy);
        const fila = (id, hora) => ({ id, fechaHora: `${dia}T${hora}:00`, nombreReserva: id,
            IdEstadoReserva: 2, estado: 'Confirmada', telefono: '1155551234', cantidadDePersonas: 2 });
        render(<Reservas datos_reservas={[fila('Tarde', '20:45'), fila('Temprano', '20:10')]} recargarComponentes={vi.fn()} />);
        expect(screen.getAllByText(/Temprano|Tarde/).map(e => e.textContent)).toEqual(['Temprano', 'Tarde']);
        const otro = claveDia(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() === 1 ? 2 : 1));
        fireEvent.click(screen.getByRole('button', { name: `${otro}, 0 reservas` }));
        expect(screen.queryByText('Temprano')).toBeNull();
        expect(screen.getByRole('status').textContent).toContain('No hay reservas');
        fireEvent.click(screen.getByRole('button', { name: 'Hoy' }));
        expect(screen.getByText('Temprano')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
        expect(screen.getByLabelText(/Fecha y Hora/).value).toBe(`${dia}T20:00`);
    });
});
