import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL + "TipoPagos"

// Función helper para obtener los headers de autorización y tenant
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');
    return {
        headers: {
            Authorization: 'Bearer ' + token,
            'X-Tenant-ID': tenantId || ''
        }
    };
}

export async function BuscarTodosLosTipoPagos() {
    try {
        const response = await axios.get(BASE_URL, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        return error.response;
    }
}

export async function CrearTipoPago(datos) {
    try {
        // El endpoint recibe un string, así que enviamos el nombre directamente
        const nombre = datos.nombre || datos; // Por si acaso viene directamente el string
        const response = await axios.post(BASE_URL, nombre, {
            headers: {
                ...getAuthHeaders().headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al crear el tipo de pago";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function BuscarUnTipoPago(Id) {
    try {
        const response = await axios.get(`${BASE_URL}/${Id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        return error.response;
    }
}

export async function ModificarTipoPago(datos) {
    try {
        // Asumiendo que el PUT también recibe un string (el nombre)
        const nombre = datos.nombre || datos; // Por si acaso viene directamente el string
        const response = await axios.put(`${BASE_URL}/${datos.id}`, nombre, {
            headers: {
                ...getAuthHeaders().headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al modificar el tipo de pago";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function BorrarTipoPago(Id, Token) {
    // Token se mantiene como parámetro para compatibilidad, pero se obtiene de localStorage
    try {
        const response = await axios.delete(`${BASE_URL}/${Id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al eliminar el tipo de pago";
            alert(errorMessage);
        }
        return error.response;
    }
}

