import axios from 'axios';
import { authService } from '../services/authService';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * POST /PagarItems - Registra un pago de productos de una visita (crea registro en tabla Pagos).
 * @param {string} idVisita - Guid de la visita
 * @param {number[]} listaIdsProductos - IDs de productos (ProductosPorVisita) a marcar como pagados
 * @param {number} idTipoPago - ID del tipo de pago (ej. 1 Efectivo, 2 Tarjeta)
 * @param {number} monto - Efectivo: monto con el que paga el cliente. Otros: total de los productos
 * @returns {Promise<object>} Pago creado
 */
export async function PagarItems(idVisita, listaIdsProductos, idTipoPago, monto) {
    try {
        const response = await axios.post(
            `${BASE_URL}PagarItems`,
            {
                idTipoMovimiento: idTipoPago,
                idVisita,
                monto: Number(monto),
                listaIdsProductos: Array.isArray(listaIdsProductos) ? listaIdsProductos : []
            },
            authService.getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error al registrar pago (PagarItems):', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}
