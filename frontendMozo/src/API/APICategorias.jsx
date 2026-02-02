import axios from 'axios'
import { authService } from '../services/authService'

const BASE_URL = import.meta.env.VITE_BASE_URL + "Categorias"

export async function BuscarTodasLasCategorias() {
    try {
        const response = await axios.get(BASE_URL, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al buscar categorías:", error);
        return [];
    }
}

export async function CrearCategoria(datos) {
    try {
        const response = await axios.post(BASE_URL, { 
            Nombre: datos.nombre, 
            Activo: true 
        }, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al crear la categoría";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function BuscarUnaCategoria(Id) {
    try {
        const response = await axios.get(`${BASE_URL}/${Id}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        return error.response;
    }
}


export async function ModificarCategoria(datos) {
    try {
        const body = {};
        if (datos.nombre !== undefined) {
            body.Nombre = datos.nombre;
        }
        if (datos.activo !== undefined) {
            body.Activo = datos.activo;
        }
        
        const response = await axios.put(`${BASE_URL}/${datos.id}`, body, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al modificar la categoría";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function ActivarDesactivarCategoria(Id) {
    try {
        const response = await axios.patch(`${BASE_URL}/ActivarDesactivar`, { 
            Id: Id 
        }, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al activar/desactivar la categoría";
            alert(errorMessage);
        }
        return error.response;
    }
}

// Funciones legacy - mantener para compatibilidad pero usar ActivarDesactivarCategoria
export async function ActivarCategoria(Id) {
    return await ActivarDesactivarCategoria(Id);
}

export async function DesactivarCategoria(Id) {
    return await ActivarDesactivarCategoria(Id);
}

export async function BorrarCategoria(Id, Token) {
    // Token se mantiene como parámetro para compatibilidad, pero se obtiene de localStorage
    try {
        const response = await axios.delete(`${BASE_URL}/${Id}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al eliminar la categoría";
            alert(errorMessage);
        }
        return error.response;
    }
}


