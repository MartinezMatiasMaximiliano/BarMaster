import api from '../services/axiosInstance'
import { sendHubMessage } from '../connections/HubConnMozo'
import { construirError } from './APIError';

export async function CambiarEstadoItems(ListaIds, Estado) {
    try {
        const response = await api.put("Items/" + Estado, ListaIds, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data;
    } catch (error) {
        console.error('Error al cambiar estado de items:', construirError(error, 'Error al cambiar el estado de los items'));
        throw construirError(error, 'Error al cambiar el estado de los items');
    }
}
export async function EliminarItems(ListaIds,numeroMesa) {
    try {
        const response = await api.delete("Items/", {
            data: ListaIds,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        await sendHubMessage("RecargarTicket", numeroMesa); //Envio mensaje al cliente para que se actualice su cuenta y se quiten los productos eliminados
        return response.data;
    } catch (error) {
        console.error('Error al eliminar items:', construirError(error, 'Error al eliminar los items'));
        return error.response
    }
}
