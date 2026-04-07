import api from '../services/axiosInstance';
import { construirError } from './APIError';

/**
 * GET /Ticket/{idMovimientoCaja} - Obtiene los datos públicos de un ticket de pago
 * Este endpoint NO requiere autenticación (es público para clientes)
 * @param {string} idMovimientoCaja - GUID del movimiento de caja
 * @returns {Promise<object>} Datos del ticket (productos, fecha, mesa, total, etc.)
 */
export async function ObtenerTicket(tenantId, idMovimientoCaja) {
    try {
        const response = await api.get(`Ticket/${idMovimientoCaja}`, {
            headers: {
                'X-Tenant-ID': tenantId
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener ticket:", construirError(error, 'Error al obtener ticket'));
        throw construirError(error, 'Error al obtener ticket');
    }
}
