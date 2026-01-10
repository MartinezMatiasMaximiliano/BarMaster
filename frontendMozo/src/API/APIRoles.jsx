import axios from 'axios'
import { authService } from '../services/authService'

const BASE_URL = import.meta.env.VITE_BASE_URL + "Roles/"

export async function BuscarTodosLosRoles() {
    try {
        const response = await axios.get(BASE_URL, authService.getAuthHeaders());
        // Verificar si la respuesta es un array directamente o está dentro de un objeto
        const data = response.data;
        if (Array.isArray(data)) {
            return data;
        }
        // Si viene en un formato diferente, intentar extraer el array
        if (data && Array.isArray(data.data)) {
            return data.data;
        }
        console.warn("Formato de respuesta inesperado para roles:", data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error al buscar roles:", error);
        throw error;
    }
}

export async function CrearRol(nombre) {
    try {
        const response = await axios.post(BASE_URL , { nombre:nombre });
        return response.data;
    } catch (error) {
        alert(error.response.data.error.mensaje);
        return error.response.data
    }
}

export async function BuscarUnRol(Id) {
    try {
        const response = await axios.get(BASE_URL + Id);
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function ModificarRol(Id, Nombre) {
    try {
        const response = await axios.put(BASE_URL + Id, { nombre: Nombre});
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function BorrarRol(Id, Token) {
    try {
        const response = await axios.delete(BASE_URL + Id, { headers: { Authorization: 'Bearer ' + Token } })
        return response.data;
    } catch (error) {
        return error.response
    }
}
