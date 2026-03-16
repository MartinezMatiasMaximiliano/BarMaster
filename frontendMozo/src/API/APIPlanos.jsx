import api from '../services/axiosInstance'

export async function BuscarTodosLosPlanos() {
    try {
        const response = await api.get('ListaPlanosSucursal');
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
        const response = await api.get(`Plano?IdPlano=${IdPlano}`);
        return response.data;
    } catch (error) {
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
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al crear el plano";
        throw new Error(mensaje);
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
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al modificar el plano";
        throw new Error(mensaje);
    }
}

export async function BorrarPlano(IdPlano, Token) {
    // Token se mantiene como parámetro para compatibilidad, pero se obtiene de localStorage
    try {
        const response = await api.delete(`Plano?IdPlano=${IdPlano}`);
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al eliminar el plano";
        throw new Error(mensaje);
    }
}
