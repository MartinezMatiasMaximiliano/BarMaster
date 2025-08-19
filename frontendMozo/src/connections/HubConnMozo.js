import * as SignalR from '@microsoft/signalr';


//HUB CONNECTION MOZO
const hubURL = import.meta.env.VITE_BASE_URL + "NotificacionesHub"

const connection = new SignalR.HubConnectionBuilder().withUrl(hubURL, {
    withCredentials: false
})
    .build();

const ConectarAHub = async () => {
    await connection.start()
        .then(() => console.log("Conectado al Hub"))
        .catch(err => console.error("Connection error:", err));

    connection.send("RegistrarMozoAGrupo", connection.connectionId)
}

ConectarAHub()
export default connection;