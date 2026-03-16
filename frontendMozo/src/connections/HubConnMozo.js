import * as SignalR from '@microsoft/signalr';

//HUB CONNECTION MOZO
const hubURL = import.meta.env.VITE_BASE_URL + "NotificacionesHub"

const connection = new SignalR.HubConnectionBuilder().withUrl(hubURL, {
    withCredentials: false
})
    .withAutomaticReconnect()
    .build();

export async function ConectarAHub() {
    try {
        await connection.start();
        connection.send("RegistrarMozoAGrupo", connection.connectionId);
    } catch (err) {
        console.error("Connection error:", err);
    }
}

connection.onreconnected(() => {
    connection.send("RegistrarMozoAGrupo", connection.connectionId)
        .catch(err => console.error("Error re-registering after reconnect:", err));
});

ConectarAHub();
export default connection;
