import api from '../services/axiosInstance'
import { construirError } from './APIError';

export async function BuscarMesasDisponibles(fechaHora) {
    try {
        const instante = new Date(fechaHora).getTime();
        if (!Number.isFinite(instante)) throw new Error('Seleccioná un día y una hora válidos.');
        const response = await api.get('Reservas/Disponibilidad', { params: { fechaHora: new Date(instante).toISOString() } });
        if (!Array.isArray(response.data)) {
            throw new Error('No se pudo consultar la disponibilidad.');
        }
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al consultar la disponibilidad');
    }
}

export async function BuscarTodasLasReservas() {
    try {
        const response = await api.get('Reservas');
        return response.data;
    } catch (error) {
        console.error("Error:", construirError(error, 'Error al buscar reservas'));
        throw construirError(error, 'Error al buscar reservas');
    }
}

export async function CrearReserva(datos) {
    try {
        const response = await api.post('Reservas', datos);
        return response.data;
    } catch (error) {
        console.error('Error al crear reserva:', construirError(error, 'Error al crear la reserva'));
        throw construirError(error, 'Error al crear la reserva');
    }
}

export async function ModificarReserva(datos) {
    try {
        const response = await api.put('Reservas', { ...datos, ...(Object.hasOwn(datos, 'idMesa') ? { idMesa: datos.idMesa || null } : {}) });
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al modificar la reserva");
    }
}

export async function BorrarReserva(Id) {
    try {
        const response = await api.delete(`Reservas?Id=${Id}`);
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al eliminar la reserva");
    }
}
