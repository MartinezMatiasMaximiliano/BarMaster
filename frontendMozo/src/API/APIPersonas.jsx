import axios from 'axios'
import { authService } from '../services/authService'

const BASE_URL = import.meta.env.VITE_BASE_URL

export async function BuscarTodosLosMozos() {
    try {
        const response = await axios.get(`${BASE_URL}Mozos`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al buscar mozos:", error);
        throw error;
    }
}

export async function BuscarTodasLasPersonas() {
    try {
        const response = await axios.get(`${BASE_URL}ListaEmpleados`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al buscar personas:", error);
        throw error;
    }
}

export async function RegistrarPersona(datos) {
    try {
        const response = await axios.post(`${BASE_URL}Registrar`, {
            nombres: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            password: datos.dni || datos.password || '', // Usar DNI como password por defecto
            direccion: datos.direccion || '',
            telefono: datos.telefono || '',
            email: datos.email || '',
            activo: true,
            idRol: datos.rol
        }, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al registrar la persona';
        alert(errorMessage);
        throw error;
    }
}

export async function RegistrarMozo(datos) {
    try {
        const response = await axios.post(`${BASE_URL}Registrar`, {
            nombres: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            password: datos.dni || datos.password || '',
            direccion: datos.direccion || '',
            telefono: datos.telefono || '',
            email: datos.email || '',
            activo: true,
            idRol: -2 // ID especial para mozos
        }, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al registrar el mozo';
        alert(errorMessage);
        throw error;
    }
}

export async function ModificarPersona(datos) {
    try {
        const response = await axios.put(`${BASE_URL}Modificar`, {
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
        }, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al modificar la persona';
        alert(errorMessage);
        throw error;
    }
}

export async function ModificarPassword(id, nuevoPassword) {
    try {
        const response = await axios.put(
            `${BASE_URL}Personas/password/${id}`,
            JSON.stringify(nuevoPassword),
            {
                headers: {
                    "Content-Type": "application/json",
                    ...authService.getAuthHeaders().headers
                }
            }
        );
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al modificar la contraseña';
        alert(errorMessage);
        throw error;
    }
}



export async function ModificarCodigoMozo(datos) {
    try {
        const response = await axios.put(`${BASE_URL}Modificar`, {
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
        }, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al modificar el código del mozo';
        alert(errorMessage);
        throw error;
    }
}

export async function ActivarPersona(Id) {
    try {
        const response = await axios.put(`${BASE_URL}activarDesactivar/${Id}`, {}, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al activar la persona';
        alert(errorMessage);
        throw error;
    }
}

export async function DesactivarPersona(Id) {
    try {
        // El mismo endpoint cambia el estado, así que llamamos al mismo endpoint
        const response = await axios.put(`${BASE_URL}activarDesactivar/${Id}`, {}, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al desactivar la persona';
        alert(errorMessage);
        throw error;
    }
}


export async function BorrarPersona(Id) {
    console.log("ID EN API: ", Id)
    try {
        console.log("URL: ", `${BASE_URL}Eliminar/${Id}`)
        const response = await axios.delete(`${BASE_URL}Eliminar/${Id}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error?.mensaje || 
                           error.response?.data?.mensaje || 
                           'Error al eliminar la persona';
        alert(errorMessage);
        throw error;
    }
}



