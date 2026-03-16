import axios from 'axios'
import api from '../services/axiosInstance'
import { authService } from '../services/authService'

export async function BuscarTodosLosMozos() {
    try {
        const response = await api.get('Mozos');
        return response.data;
    } catch (error) {
        console.error("Error al buscar mozos:", error);
        throw error;
    }
}

export async function BuscarTodasLasPersonas() {
    try {
        const response = await api.get('ListaEmpleados');
        return response.data;
    } catch (error) {
        console.error("Error al buscar personas:", error);
        throw error;
    }
}

export async function RegistrarPersona(datos) {
    try {
        const response = await api.post('Registrar', {
            nombres: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            password: datos.dni || datos.password || '', // Usar DNI como password por defecto
            direccion: datos.direccion || '',
            telefono: datos.telefono || '',
            email: datos.email || '',
            activo: true,
            idRol: datos.rol
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al registrar la persona';
        throw new Error(errorMessage);
    }
}

export async function RegistrarMozo(datos) {
    try {
        const response = await api.post('Registrar', {
            nombres: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            password: datos.dni || datos.password || '',
            direccion: datos.direccion || '',
            telefono: datos.telefono || '',
            email: datos.email || '',
            activo: true,
            idRol: -2 // ID especial para mozos
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al registrar el mozo';
        throw new Error(errorMessage);
    }
}

export async function ModificarPersona(datos) {
    try {
        const response = await api.put('Modificar', {
            id: datos.id,
            nombres: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            direccion: datos.direccion || '',
            telefono: datos.telefono || '',
            email: datos.email || '',
            idRol: datos.rol,
            codigoDeServicio: datos.codigoDeServicio || '',
            activo: datos.activo !== undefined ? datos.activo : true
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al modificar la persona';
        throw new Error(errorMessage);
    }
}

export async function ModificarPassword(contraseñaActual, contraseñaNueva, confirmacionContraseña) {
    const response = await axios.put(
        import.meta.env.VITE_BASE_URL + 'CambiarContraseña',
        {
            contraseñaActual,
            contraseñaNueva,
            confirmacionContraseña,
        }, authService.getAuthHeaders('USER_token')
    );
    return response.data;
}



export async function ModificarCodigoMozo(datos) {
    try {
        const response = await api.put('Modificar', {
            id: datos.id,
            nombres: datos.nombres || '',
            apellido: datos.apellido || '',
            dni: datos.dni || '',
            direccion: datos.direccion || '',
            telefono: datos.telefono || '',
            email: datos.email || '',
            idRol: datos.idRol || datos.rol || 0,
            codigoDeServicio: datos.nuevoCodigo,
            activo: datos.activo !== undefined ? datos.activo : true
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al modificar el código del mozo';
        throw new Error(errorMessage);
    }
}

export async function ActivarPersona(Id) {
    try {
        const response = await api.put(`activarDesactivar/${Id}`, {});
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje ||
                           error.response?.data?.mensaje ||
                           'Error al activar la persona';
        throw new Error(errorMessage);
    }
}

export async function DesactivarPersona(Id) {
    try {
        // El mismo endpoint cambia el estado, así que llamamos al mismo endpoint
        const response = await api.put(`activarDesactivar/${Id}`, {});
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje ||
                           error.response?.data?.mensaje ||
                           'Error al desactivar la persona';
        throw new Error(errorMessage);
    }
}


export async function BorrarPersona(Id) {
    try {
        const response = await api.delete(`Eliminar/${Id}`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al eliminar la persona';
        throw new Error(errorMessage);
    }
}



