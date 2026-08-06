import { useEffect, useRef } from 'react'
import connection from '../connections/HubConnMozo'

export default function useSignalR(handlers = {}) {
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        if (!connection) return;

        const onRegistrarProducto = (...args) => handlersRef.current.onRegistrarProducto?.(...args);
        const onVisitaActualizada = (...args) => handlersRef.current.onVisitaActualizada?.(...args);
        const onRegistrarNotificacion = (...args) => handlersRef.current.onRegistrarNotificacion?.(...args);
        const onPagarMesa = (...args) => handlersRef.current.onPagarMesa?.(...args);
        const onPagarMesaSeparado = (...args) => handlersRef.current.onPagarMesaSeparado?.(...args);
        const onRecargarTicket = (...args) => handlersRef.current.onRecargarTicket?.(...args);
        const onRecargarDeliveryTakeaway = (...args) => handlersRef.current.onRecargarDeliveryTakeaway?.(...args);

        connection.on('RegistrarProducto', onRegistrarProducto);
        connection.on('VisitaActualizada', onVisitaActualizada);
        connection.on('RegistrarNotificacion', onRegistrarNotificacion);
        connection.on('PagarMesa', onPagarMesa);
        connection.on('PagarMesaSeparado', onPagarMesaSeparado);
        connection.on('RecargarTicket', onRecargarTicket);
        connection.on('RecargarDeliveryTakeaway', onRecargarDeliveryTakeaway);

        return () => {
            connection.off('RegistrarProducto', onRegistrarProducto);
            connection.off('VisitaActualizada', onVisitaActualizada);
            connection.off('RegistrarNotificacion', onRegistrarNotificacion);
            connection.off('PagarMesa', onPagarMesa);
            connection.off('PagarMesaSeparado', onPagarMesaSeparado);
            connection.off('RecargarTicket', onRecargarTicket);
            connection.off('RecargarDeliveryTakeaway', onRecargarDeliveryTakeaway);
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

    const sendRecargarDeliveryTakeaway = () => {
        if (!connection) return;
        try { connection.send('RecargarDeliveryTakeaway'); } catch (e) { console.error(e); }
    }

    const registrarMozoAGrupo = (connectionId) => {
        if (!connection) return;
        try { connection.send('RegistrarMozoAGrupo', connectionId); } catch (e) { console.error(e); }
    }

    return { sendRecargarTicket, sendRecargarMenu, sendRecargarDeliveryTakeaway, registrarMozoAGrupo };
}
