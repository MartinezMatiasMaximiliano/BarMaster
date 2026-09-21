import api from '../services/axiosInstance';
import { sendHubMessage } from '../connections/HubConnMozo';
import { construirError } from './APIError';

export async function BuscarStock() {
    try {
        const response = await api.get('Stock');
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al buscar el stock');
    }
}

export async function BuscarAlertasStock() {
    try {
        const response = await api.get('Stock/alertas');
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al buscar las alertas de stock');
    }
}

export async function BuscarMovimientosStock(idProducto) {
    try {
        const response = await api.get(`Stock/movimientos/${idProducto}`);
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al buscar los movimientos de stock');
    }
}

export async function ConfigurarStock(idProducto, configuracion) {
    try {
        const response = await api.put(`Stock/${idProducto}`, {
            ControlaStock: configuracion.controlaStock,
            EnviarAlerta: configuracion.enviarAlerta,
            CantidadMinima: configuracion.cantidadMinima,
            CantidadInicial: configuracion.cantidadInicial,
        });
        await sendHubMessage('StockActualizado');
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al configurar el stock');
    }
}

export async function RegistrarMovimientoStock(idProducto, movimiento) {
    try {
        const response = await api.put(`Stock/movimientos/${idProducto}`, {
            Cantidad: movimiento.cantidad,
            Motivo: movimiento.motivo || null,
        });
        await sendHubMessage('StockActualizado');
        return response.data;
    } catch (error) {
        throw construirError(error, 'Error al registrar el movimiento de stock');
    }
}
