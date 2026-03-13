import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * GET /Ticket/{idMovimientoCaja} - Obtiene los datos públicos de un ticket de pago
 * Este endpoint NO requiere autenticación (es público para clientes)
 * @param {string} idMovimientoCaja - GUID del movimiento de caja
 * @returns {Promise<object>} Datos del ticket (productos, fecha, mesa, total, etc.)
 */
export async function ObtenerTicket(tenantId, idMovimientoCaja) {
    const response = await axios.get(`${BASE_URL}Ticket/${idMovimientoCaja}`,{
            headers: {
                'X-Tenant-ID': tenantId
            }
        }
    );
    return response.data;
}
