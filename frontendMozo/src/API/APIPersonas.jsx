import axios from 'axios'
import api from '../services/axiosInstance'
import { authService } from '../services/authService'
import { construirError } from './APIError';

export async function BuscarTodosLosMozos() {
    try {
        const response = await api.get('Mozos');
        return response.data;
    } catch (error) {
        console.error("Error al buscar mozos:", construirError(error, 'Error al buscar mozos'));
        throw construirError(error, 'Error al buscar mozos');
    }
}

export async function BuscarTodasLasPersonas() {
    try {
        const response = await api.get('ListaEmpleados');
        return response.data;
    } catch (error) {
        console.error("Error al buscar personas:", construirError(error, 'Error al buscar personas'));
        throw construirError(error, 'Error al buscar personas');
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
        throw construirError(error, 'Error al registrar la persona');
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
        throw construirError(error, 'Error al registrar el mozo');
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
        throw construirError(error, 'Error al modificar la persona');
    }
}

export async function ModificarPassword(contraseñaActual, contraseñaNueva, confirmacionContraseña) {
    try {
        const response = await axios.put(
            import.meta.env.VITE_BASE_URL + 'CambiarContraseña',
            {
                contraseñaActual,
                contraseñaNueva,
                confirmacionContraseña,
            }, authService.getAuthHeaders('USER_token')
        );
        return response.data;
    } catch (error) {
        console.error('Error al modificar contraseña:', construirError(error, 'Error al cambiar la contraseña'));
        throw construirError(error, 'Error al cambiar la contraseña');
    }
}

export async function ModificarPersonaje(idPersona, personajeId) {
    try {
        const response = await api.put('Persona/Personaje', {
            idPersona,
            personajeId,
        });
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al guardar el personaje');
    }
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
        throw construirError(error, 'Error al modificar el código del mozo');
    }
}

export async function ActivarPersona(Id) {
    try {
        const response = await api.put(`activarDesactivar/${Id}`, {});
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al activar la persona');
    }
}

export async function DesactivarPersona(Id) {
    try {
        // El mismo endpoint cambia el estado, así que llamamos al mismo endpoint
        const response = await api.put(`activarDesactivar/${Id}`, {});
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al desactivar la persona');
    }
}


export async function BorrarPersona(Id) {
    try {
        const response = await api.delete(`Eliminar/${Id}`);
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al eliminar la persona');
    }
}



