import api from '../services/axiosInstance';
import { construirError } from './APIError';

function normalizarTipoEnvio(tipo) {
    return {
        id: tipo.id ?? tipo.Id,
        nombre: (tipo.nombre ?? tipo.Nombre ?? '').toString().trim(),
        precio: Number(tipo.precio ?? tipo.Precio ?? 0)
    };
}

export async function BuscarTodosLosTipoEnvios() {
    try {
        const response = await api.get('TipoEnvios');
        const data = Array.isArray(response.data) ? response.data : [];
        return data.map(normalizarTipoEnvio);
    } catch (error) {
        console.error('Error al buscar tipos de envío:', construirError(error, 'Error al obtener los tipos de envío'));
        throw construirError(error, 'Error al obtener los tipos de envío');
    }
}

export async function CrearTipoEnvio(datos) {
    try {
        const payload = {
            Nombre: datos.nombre,
            Precio: Number(datos.precio)
        };
        const response = await api.post('TipoEnvios', payload);
        return normalizarTipoEnvio(response.data ?? {});
    } catch (error) {
        throw construirError(error, 'Error al crear el tipo de envío');
    }
}

export async function ModificarTipoEnvio(datos) {
    try {
        const payload = {};

        if (datos.nombre !== undefined) {
            payload.Nombre = datos.nombre;
        }
        if (datos.precio !== undefined && datos.precio !== '') {
            payload.Precio = Number(datos.precio);
        }

        const response = await api.patch(`TipoEnvios/${datos.id}`, payload);
        return normalizarTipoEnvio(response.data ?? {});
    } catch (error) {
        throw construirError(error, 'Error al modificar el tipo de envío');
    }
}

export async function EliminarTipoEnvio(id) {
    try {
        const response = await api.delete(`TipoEnvios/${id}`);
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al eliminar el tipo de envío');
    }
}
