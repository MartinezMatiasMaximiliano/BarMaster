import * as SignalR from '@microsoft/signalr';

//HUB CONNECTION CLIENTE
const hubURL = import.meta.env.VITE_BASE_URL + "NotificacionesHub"

const connection = new SignalR.HubConnectionBuilder().withUrl(hubURL, {
    withCredentials: false
})
    .withAutomaticReconnect()
    .build();

const ConectarAHub = async () => {
    await connection.start()
        .then(() => console.log("Conectado al Hub"))
        .catch(err => console.error("Connection error:", err));
}

ConectarAHub()
export default connection;