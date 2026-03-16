import api from '../services/axiosInstance'

export async function BuscarTodasLasCategorias() {
    try {
        const response = await api.get('Categorias');
        return response.data;
    } catch (error) {
        console.error("Error al buscar categorías:", error);
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
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al crear la categoría";
        throw new Error(mensaje);
    }
}

export async function BuscarUnaCategoria(Id) {
    try {
        const response = await api.get(`Categorias/${Id}`);
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

        const response = await api.put(`Categorias/${datos.id}`, body);
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al modificar la categoría";
        throw new Error(mensaje);
    }
}

export async function ActivarDesactivarCategoria(Id) {
    try {
        const response = await api.patch('Categorias/ActivarDesactivar', {
            Id: Id
        });
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al activar/desactivar la categoría";
        throw new Error(mensaje);
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
        const mensaje = error.response?.data?.error?.mensaje
            || (typeof error.response?.data === 'string' ? error.response.data : null)
            || "Error al eliminar la categoría";
        throw new Error(mensaje);
    }
}
