import api from '../services/axiosInstance'
import { construirError } from './APIError';

export async function BuscarTipoMovimientosPorEntorno(entorno) {
    try {
        const response = await api.get('TipoMovimientosCaja', {
            params: { Entorno: entorno }
        });
        return response.data;
    } catch (error) {
        console.error("Error:", construirError(error, 'Error al buscar tipos de movimiento de caja'));
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
        const response = await api.post('TipoMovimientosCaja', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al crear el tipo de movimiento");
    }
}

export async function EliminarTipoMovimientoCaja(id) {
    try {
        const response = await api.delete(`TipoMovimientosCaja/${id}`);
        return response.data;
    } catch (error) {
        throw construirError(error, "Error al eliminar el tipo de movimiento");
    }
}
