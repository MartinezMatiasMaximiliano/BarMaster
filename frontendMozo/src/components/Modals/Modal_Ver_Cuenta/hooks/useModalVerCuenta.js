import { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { CambiarEstadoItems } from '../../../../API/APIItems';
import { GenerarTicketPDF } from '../../../../API/APIPedidos';
import { cambiarEstadoItems as CambiarEstadoItemsState } from '../../../../redux/slices/pedidosActivosSlice';
import { eliminar as eliminarTicket } from '../../../../redux/slices/ticketSlice';
import connection from '../../../../connections/HubConnMozo';

/**
 * Hook personalizado para manejar toda la lógica de negocio del modal Ver Cuenta
 * Centraliza el estado, cálculos y acciones relacionadas con la cuenta de una mesa
 */
export const useModalVerCuenta = (datosMesa, cerrarModalMesa) => {
    const dispatch = useDispatch();

    // Selector optimizado con shallowEqual para evitar re-renders innecesarios
    const pedidosActivos = useSelector(
        (state) => state.pedidosActivos.value,
        shallowEqual
    );

    // Estado del modal
    const [show, setShow] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    // Filtrar pedidos de la mesa actual
    const pedidosMesa = useMemo(() => {
        if (!pedidosActivos || pedidosActivos.length === 0) return [];
        return pedidosActivos.filter(pedido => pedido.numeroMesa === datosMesa.numeroMesa);
    }, [pedidosActivos, datosMesa.numeroMesa]);

    // Calcular items disponibles para pagar
    const itemsAPagar = useMemo(() => {
        if (!pedidosMesa[0]?.items) return [];
        return pedidosMesa[0].items
            .filter(item => item.estado !== 2)
            .map(item => item.id);
    }, [pedidosMesa]);

    // Calcular total de pedidos
    const totalPedidos = useMemo(() => {
        if (!pedidosMesa[0]?.items) return 0;
        return pedidosMesa[0].items.reduce((acc, item) => acc + (item.precio || 0), 0);
    }, [pedidosMesa]);

    // Calcular cantidad de items
    const cantidadItems = useMemo(() => {
        return pedidosMesa[0]?.items?.length ?? 0;
    }, [pedidosMesa]);

    // Formateador de moneda
    const currencyFormatter = useMemo(
        () =>
            new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 2
            }),
        []
    );

    // Handlers del modal
    const handleClose = useCallback(() => {
        setShow(false);
        setTabValue(0);
    }, []);

    const handleShow = useCallback(() => {
        setShow(true);
    }, []);

    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);

    // Función para pagar/facturar la mesa
    const PagarMesa = useCallback((arregloIds) => {
        // Actualizar la base de datos
        CambiarEstadoItems(arregloIds, "Pagar");

        // Generar la factura PDF
        GenerarTicketPDF(datosMesa.numeroMesa, arregloIds);

        // Enviar mensaje al cliente para actualizar su cuenta
        connection.send("RecargarTicket", datosMesa.numeroMesa);

        // Actualizar el estado de pedidosActivos en Redux
        dispatch(CambiarEstadoItemsState({ idsItems: arregloIds, estadoNuevo: 2 }));

        // Actualizar el estado de ticket en Redux
        dispatch(eliminarTicket(arregloIds));

        alert("Pedidos facturados");

        handleClose();
        cerrarModalMesa();
    }, [datosMesa.numeroMesa, cerrarModalMesa, dispatch, handleClose]);

    return {
        // Estado
        show,
        tabValue,
        pedidosMesa,
        itemsAPagar,
        totalPedidos,
        cantidadItems,
        currencyFormatter,
        
        // Handlers
        handleClose,
        handleShow,
        handleTabChange,
        PagarMesa
    };
};

