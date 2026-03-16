import api from '../services/axiosInstance'

export async function BuscarTodasLasReservas() {
    try {
        const response = await api.get('Reservas');
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        return error.response;
    }
}

export async function BuscarUnaReserva(Id) {
    try {
        const response = await api.get(`Reservas/${Id}`);
        return response.data;
    } catch (error) {
        return error.response;
    }
}

export async function CrearReserva(datos) {
    try {
        const response = await api.post('Reservas', datos);
        return response.data;
    } catch (error) {
        return error.response;
    }
}

export async function ModificarReserva(datos) {
    try {
        const response = await api.put('Reservas', datos);
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al modificar la reserva";
        throw new Error(mensaje);
    }
}

export async function BorrarReserva(Id) {
    try {
        const response = await api.delete(`Reservas?Id=${Id}`);
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al eliminar la reserva";
        throw new Error(mensaje);
    }
}
