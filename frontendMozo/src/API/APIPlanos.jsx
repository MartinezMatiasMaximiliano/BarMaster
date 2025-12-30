import axios from 'axios'
import { authService } from '../services/authService'

const BASE_URL = import.meta.env.VITE_BASE_URL

export async function BuscarTodosLosPlanos() {
    try {
        const response = await axios.get(`${BASE_URL}ListaPlanosSucursal`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al buscar planos:", error);
        // Si hay un error en la respuesta, lanzarlo para que se maneje en el componente
        if (error.response) {
            throw error;
        }
        // Si no hay respuesta, retornar array vacío
        return [];
    }
}

export async function BuscarUnPlano(IdPlano) {
    try {
        const response = await axios.get(`${BASE_URL}Plano?IdPlano=${IdPlano}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        return error.response;
    }
}

export async function CrearPlano(datos) {
    try {
        const response = await axios.post(`${BASE_URL}Plano`, {
            Nombre: datos.nombre,
            Detalles: datos.detalles || ''
        }, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al crear el plano";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function ModificarPlano(datos) {
    try {
        const body = {
            IdPlano: datos.id
        };
        if (datos.nombre !== undefined) {
            body.Nombre = datos.nombre;
        }
        if (datos.detalles !== undefined) {
            body.Detalles = datos.detalles;
        }
        
        const response = await axios.put(`${BASE_URL}Plano`, body, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al modificar el plano";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function BorrarPlano(IdPlano, Token) {
    // Token se mantiene como parámetro para compatibilidad, pero se obtiene de localStorage
    try {
        const response = await axios.delete(`${BASE_URL}Plano?IdPlano=${IdPlano}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al eliminar el plano";
            alert(errorMessage);
        }
        return error.response;
    }
}

