import api from '../services/axiosInstance';
import { construirError } from './APIError';

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
        const response = await api.post(
            'PagarItems',
            {
                idTipoMovimiento: idTipoPago,
                idVisita,
                monto: Number(monto),
                listaIdsProductos: Array.isArray(listaIdsProductos) ? listaIdsProductos : []
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al registrar pago (PagarItems):', construirError(error, 'Error al registrar el pago'));
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw construirError(error, 'Error al registrar el pago');
    }
}
