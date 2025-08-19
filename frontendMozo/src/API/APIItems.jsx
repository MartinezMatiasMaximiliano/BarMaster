import axios from 'axios'
import connection from '../connections/HubConnMozo'
const BASE_URL = import.meta.env.VITE_BASE_URL + "Items/"

export async function CambiarEstadoItems(ListaIds, Estado) {
    try {
        const response = await axios.put(BASE_URL + Estado, ListaIds, {
            headers: { "Content-Type": "application/json" }
        }).then(function (response) {
            return response.data;
        }).catch(function (error) {
            return error;
        });
        return response.data;
    } catch (e) {
        return e.response;
    }
};
export async function EliminarItems(ListaIds,numeroMesa) {
    try {
        const response = await axios.delete(BASE_URL, {
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
