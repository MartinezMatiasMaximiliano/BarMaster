import api from '../services/axiosInstance'
import { construirError } from './APIError';

export async function BuscarTodosLosRoles() {
    try {
        const response = await api.get('Roles/');
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
        console.error("Error al buscar roles:", construirError(error, 'Error al buscar roles'));
        throw construirError(error, 'Error al buscar roles');
    }
}

export async function CrearRol(nombre) {
    try {
        const response = await api.post('Roles/' , { nombre:nombre });
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al crear el rol. Intente nuevamente.");
    }
}

export async function BuscarUnRol(Id) {
    try {
        const response = await api.get('Roles/' + Id);
        return response.data;
    } catch (error) {
        console.error('Error al buscar rol:', construirError(error, 'Error al buscar el rol'));
        return error.response
    }
}

export async function ModificarRol(Id, Nombre) {
    try {
        const response = await api.put('Roles/' + Id, { nombre: Nombre});
        return response.data;
    } catch (error) {
        console.error('Error al modificar rol:', construirError(error, 'Error al modificar el rol'));
        return error.response
    }
}

export async function BorrarRol(Id, Token) {
    try {
        const response = await api.delete('Roles/' + Id)
        return response.data;
    } catch (error) {
        console.error('Error al borrar rol:', construirError(error, 'Error al eliminar el rol'));
        return error.response
    }
}
