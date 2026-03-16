import { useEffect, useRef } from 'react'
import connection from '../connections/HubConnMozo'

export default function useSignalR(handlers = {}) {
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        if (!connection) return;

        const onRegistrarProducto = (...args) => handlersRef.current.onRegistrarProducto?.(...args);
        const onRegistrarNotificacion = (...args) => handlersRef.current.onRegistrarNotificacion?.(...args);
        const onPagarMesa = (...args) => handlersRef.current.onPagarMesa?.(...args);
        const onPagarMesaSeparado = (...args) => handlersRef.current.onPagarMesaSeparado?.(...args);

        connection.on('RegistrarProducto', onRegistrarProducto);
        connection.on('RegistrarNotificacion', onRegistrarNotificacion);
        connection.on('PagarMesa', onPagarMesa);
        connection.on('PagarMesaSeparado', onPagarMesaSeparado);

        return () => {
            connection.off('RegistrarProducto', onRegistrarProducto);
            connection.off('RegistrarNotificacion', onRegistrarNotificacion);
            connection.off('PagarMesa', onPagarMesa);
            connection.off('PagarMesaSeparado', onPagarMesaSeparado);
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
