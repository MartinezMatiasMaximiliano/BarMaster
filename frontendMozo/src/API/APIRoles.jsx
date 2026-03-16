import api from '../services/axiosInstance'

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
        console.error("Error al buscar roles:", error);
        throw error;
    }
}

export async function CrearRol(nombre) {
    try {
        const response = await api.post('Roles/' , { nombre:nombre });
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.error?.mensaje || "Error al crear el rol. Intente nuevamente.";
        throw new Error(mensaje);
    }
}

export async function BuscarUnRol(Id) {
    try {
        const response = await api.get('Roles/' + Id);
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function ModificarRol(Id, Nombre) {
    try {
        const response = await api.put('Roles/' + Id, { nombre: Nombre});
        return response.data;
    } catch (error) {
        return error.response
    }
}

export async function BorrarRol(Id, Token) {
    try {
        const response = await api.delete('Roles/' + Id)
        return response.data;
    } catch (error) {
        return error.response
    }
}
