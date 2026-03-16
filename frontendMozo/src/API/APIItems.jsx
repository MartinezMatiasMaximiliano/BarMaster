import api from '../services/axiosInstance'
import connection from '../connections/HubConnMozo'

export async function CambiarEstadoItems(ListaIds, Estado) {
    const response = await api.put("Items/" + Estado, ListaIds, {
        headers: { "Content-Type": "application/json" }
    });
    return response.data;
}
export async function EliminarItems(ListaIds,numeroMesa) {
    try {
        const response = await api.delete("Items/", {
            data: ListaIds,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        connection.send("RecargarTicket", numeroMesa); //Envio mensaje al cliente para que se actualice su cuenta y se quiten los productos eliminados
        return response.data;
    } catch (error) {
        return error.response
    }
}
