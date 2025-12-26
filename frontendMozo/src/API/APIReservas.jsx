import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL + "Reservas"

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

export async function BuscarTodasLasReservas() {
    try {
        const response = await axios.get(BASE_URL, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        return error.response;
    }
}

export async function BuscarUnaReserva(Id) {
    try {
        const response = await axios.get(`${BASE_URL}/${Id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        return error.response;
    }
}

export async function CrearReserva(datos) {
    const headers = getAuthHeaders();
    try {
        const response = await axios.post(BASE_URL, datos, getAuthHeaders());
        return response.data;
    } catch (error) {
        return error.response;
    }
}

export async function ModificarReserva(datos) {
    try {        
        const response = await axios.put(BASE_URL, datos, getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al modificar la reserva";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function BorrarReserva(Id) {
    console.log("ID EN API: ", Id)
    try {
        const response = await axios.delete(`${BASE_URL}?Id=${Id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.error?.mensaje || "Error al eliminar la reserva";
            alert(errorMessage);
        }
        return error.response;
    }
}

