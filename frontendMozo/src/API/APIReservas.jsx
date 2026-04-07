import api from '../services/axiosInstance'
import { construirError } from './APIError';

export async function BuscarTodasLasReservas() {
    try {
        const response = await api.get('Reservas');
        return response.data;
    } catch (error) {
        console.error("Error:", construirError(error, 'Error al buscar reservas'));
        return error.response;
    }
}

export async function BuscarUnaReserva(Id) {
    try {
        const response = await api.get(`Reservas/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error al buscar reserva:', construirError(error, 'Error al buscar la reserva'));
        return error.response;
    }
}

export async function CrearReserva(datos) {
    try {
        const response = await api.post('Reservas', datos);
        return response.data;
    } catch (error) {
        console.error('Error al crear reserva:', construirError(error, 'Error al crear la reserva'));
        return error.response;
    }
}

export async function ModificarReserva(datos) {
    try {
        const response = await api.put('Reservas', datos);
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
