import api from '../services/axiosInstance'
import { construirError } from './APIError';

export async function BuscarTodasLasCategorias() {
    try {
        const response = await api.get('Categorias');
        return response.data;
    } catch (error) {
        console.error("Error al buscar categorías:", construirError(error, 'Error al buscar categorías'));
        return [];
    }
}

export async function CrearCategoria(datos) {
    try {
        const response = await api.post('Categorias', {
            Nombre: datos.nombre,
            Activo: true
        });
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al crear la categoría");
    }
}

export async function BuscarUnaCategoria(Id) {
    try {
        const response = await api.get(`Categorias/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error al buscar categoría:', construirError(error, 'Error al buscar la categoría'));
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

        const response = await api.put(`Categorias/${datos.id}`, body);
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al modificar la categoría");
    }
}

export async function ActivarDesactivarCategoria(Id) {
    try {
        const response = await api.patch('Categorias/ActivarDesactivar', {
            Id: Id
        });
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al activar/desactivar la categoría");
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
        const response = await api.delete(`Categorias/${Id}`);
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al eliminar la categoría");
    }
}
