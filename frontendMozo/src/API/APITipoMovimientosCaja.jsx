import axios from 'axios'
import { authService } from '../services/authService'

const BASE_URL = import.meta.env.VITE_BASE_URL + "TipoMovimientosCaja"

export async function BuscarTipoMovimientosPorEntorno(entorno) {
    try {
        const response = await axios.get(BASE_URL, {
            ...authService.getAuthHeaders(),
            params: { Entorno: entorno }
        });
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        return error.response;
    }
}

export async function CrearTipoMovimientoCaja(datos) {
    try {
        const payload = {
            nombre: datos.nombre || datos,
            esIngreso: datos.esIngreso ?? false,
            esEfectivo: datos.esEfectivo ?? false,
        };
        const response = await axios.post(BASE_URL, payload, {
            headers: {
                ...authService.getAuthHeaders().headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string'
                ? error.response.data
                : error.response.data.message || "Error al crear el tipo de movimiento";
            alert(errorMessage);
        }
        return error.response;
    }
}

export async function EliminarTipoMovimientoCaja(id) {
    try {
        const response = await axios.delete(`${BASE_URL}/${id}`, authService.getAuthHeaders());
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string'
                ? error.response.data
                : error.response.data.message || "Error al eliminar el tipo de movimiento";
            alert(errorMessage);
        }
        return error.response;
    }
}
