import { useEffect, useRef } from 'react'
import connection, { sendHubMessage } from '../connections/HubConnMozo'

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
        const onStockActualizado = (...args) => handlersRef.current.onStockActualizado?.(...args);

        connection.on('RegistrarProducto', onRegistrarProducto);
        connection.on('VisitaActualizada', onVisitaActualizada);
        connection.on('RegistrarNotificacion', onRegistrarNotificacion);
        connection.on('PagarMesa', onPagarMesa);
        connection.on('PagarMesaSeparado', onPagarMesaSeparado);
        connection.on('RecargarTicket', onRecargarTicket);
        connection.on('RecargarDeliveryTakeaway', onRecargarDeliveryTakeaway);
        connection.on('StockActualizado', onStockActualizado);

        return () => {
            connection.off('RegistrarProducto', onRegistrarProducto);
            connection.off('VisitaActualizada', onVisitaActualizada);
            connection.off('RegistrarNotificacion', onRegistrarNotificacion);
            connection.off('PagarMesa', onPagarMesa);
            connection.off('PagarMesaSeparado', onPagarMesaSeparado);
            connection.off('RecargarTicket', onRecargarTicket);
            connection.off('RecargarDeliveryTakeaway', onRecargarDeliveryTakeaway);
            connection.off('StockActualizado', onStockActualizado);
        }
    }, []);

    const sendRecargarTicket = (numeroMesa) => {
        return sendHubMessage('RecargarTicket', numeroMesa);
    }

    const sendRecargarMenu = () => {
        return sendHubMessage('RecargarMenu');
    }

    const sendRecargarDeliveryTakeaway = () => {
        return sendHubMessage('RecargarDeliveryTakeaway');
    }

    const registrarMozoAGrupo = (connectionId) => {
        return sendHubMessage('RegistrarMozoAGrupo', connectionId);
    }

    return { sendRecargarTicket, sendRecargarMenu, sendRecargarDeliveryTakeaway, registrarMozoAGrupo };
}
