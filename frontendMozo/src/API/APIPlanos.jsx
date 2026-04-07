import api from '../services/axiosInstance'
import { construirError } from './APIError';

export async function BuscarTodosLosPlanos() {
    try {
        const response = await api.get('ListaPlanosSucursal');
        return response.data;
    } catch (error) {
        console.error("Error al buscar planos:", construirError(error, 'Error al buscar planos'));
        // Si hay un error en la respuesta, lanzarlo para que se maneje en el componente
        if (error.response) {
            throw construirError(error, 'Error al buscar planos');
        }
        // Si no hay respuesta, retornar array vacío
        return [];
    }
}

export async function BuscarUnPlano(IdPlano) {
    try {
        const response = await api.get(`Plano?IdPlano=${IdPlano}`);
        return response.data;
    } catch (error) {
        console.error('Error al buscar plano:', construirError(error, 'Error al buscar el plano'));
        return error.response;
    }
}

export async function CrearPlano(datos) {
    try {
        const response = await api.post('Plano', {
            Nombre: datos.nombre,
            Detalles: datos.detalles || ''
        });
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al crear el plano");
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

        const response = await api.put('Plano', body);
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al modificar el plano");
    }
}

export async function BorrarPlano(IdPlano, Token) {
    // Token se mantiene como parámetro para compatibilidad, pero se obtiene de localStorage
    try {
        const response = await api.delete(`Plano?IdPlano=${IdPlano}`);
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al eliminar el plano");
    }
}
