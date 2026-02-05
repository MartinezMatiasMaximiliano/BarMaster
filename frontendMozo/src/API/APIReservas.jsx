import axios from 'axios'
import { authService } from '../services/authService'

const BASE_URL = import.meta.env.VITE_BASE_URL + "Reservas"

export async function BuscarTodasLasReservas() {
    try {
        const response = await axios.get(BASE_URL, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        return error.response;
    }
}

export async function BuscarUnaReserva(Id) {
    try {
        const response = await axios.get(`${BASE_URL}/${Id}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        return error.response;
    }
}

export async function CrearReserva(datos) {
    try {
        const response = await axios.post(BASE_URL, datos, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        return error.response;
    }
}

export async function ModificarReserva(datos) {
    try {        
        const response = await axios.put(BASE_URL, datos, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al modificar la reserva";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function BorrarReserva(Id) {
    try {
        const response = await axios.delete(`${BASE_URL}?Id=${Id}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al eliminar la reserva";
            alert(errorMessage);
        }
        return error.response;
    }
}

