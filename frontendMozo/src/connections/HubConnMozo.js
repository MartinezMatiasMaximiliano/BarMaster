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
        if (connection.state === SignalR.HubConnectionState.Connected) {
            return true;
        }

        if (connection.state === SignalR.HubConnectionState.Disconnected) {
            await connection.start();
        }

        if (connection.state === SignalR.HubConnectionState.Connected) {
            return await sendHubMessage("RegistrarMozoAGrupo", connection.connectionId);
        }
    } catch (err) {
        console.error("Connection error:", err);
    }

    return false;
}

connection.onreconnected(() => {
    sendHubMessage("RegistrarMozoAGrupo", connection.connectionId);
});

export async function sendHubMessage(methodName, ...args) {
    const connected = await ConectarAHub();
    if (!connected || connection.state !== SignalR.HubConnectionState.Connected) {
        return false;
    }

    try {
        await connection.send(methodName, ...args);
        return true;
    } catch (err) {
        console.error(`Error sending hub message ${methodName}:`, err);
        return false;
    }
}

ConectarAHub();
export default connection;
