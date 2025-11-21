import { useEffect } from 'react'
import connection from '../connections/HubConnMozo'

export default function useSignalR(handlers = {}) {
    useEffect(() => {
        if (!connection) return;

        const { onRegistrarProducto, onRegistrarNotificacion, onPagarMesa, onPagarMesaSeparado } = handlers;

        if (onRegistrarProducto) connection.on('RegistrarProducto', onRegistrarProducto);
        if (onRegistrarNotificacion) connection.on('RegistrarNotificacion', onRegistrarNotificacion);
        if (onPagarMesa) connection.on('PagarMesa', onPagarMesa);
        if (onPagarMesaSeparado) connection.on('PagarMesaSeparado', onPagarMesaSeparado);

        return () => {
            if (!connection) return;
            if (onRegistrarProducto) connection.off('RegistrarProducto', onRegistrarProducto);
            if (onRegistrarNotificacion) connection.off('RegistrarNotificacion', onRegistrarNotificacion);
            if (onPagarMesa) connection.off('PagarMesa', onPagarMesa);
            if (onPagarMesaSeparado) connection.off('PagarMesaSeparado', onPagarMesaSeparado);
        }
    }, []);

    const sendRecargarTicket = (numeroMesa) => {
        if (!connection) return;
        try { connection.send('RecargarTicket', numeroMesa); } catch (e) { console.error(e); }
    }

    const sendRecargarMenu = () => {
        if (!connection) return;
        try { connection.send('RecargarMenu'); } catch (e) { console.error(e); }
    }

    const registrarMozoAGrupo = (connectionId) => {
        if (!connection) return;
        try { connection.send('RegistrarMozoAGrupo', connectionId); } catch (e) { console.error(e); }
    }

    return { sendRecargarTicket, sendRecargarMenu, registrarMozoAGrupo };
}
