import { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { CambiarEstadoItems } from '../../../../API/APIItems';
import { GenerarTicketPDF } from '../../../../API/APIPedidos';
import { cambiarEstadoPagadoProductos } from '../../../../redux/slices/visitasActivasSlice';
import { eliminar as eliminarTicket } from '../../../../redux/slices/ticketSlice';
import connection from '../../../../connections/HubConnMozo';

/**
 * Hook personalizado para manejar toda la lógica de negocio del modal Ver Cuenta
 * Centraliza el estado, cálculos y acciones relacionadas con la cuenta de una mesa
 */
export const useModalVerCuenta = (datosMesa, cerrarModalMesa) => {
    const dispatch = useDispatch();

    // Selector optimizado con shallowEqual para evitar re-renders innecesarios
    const visitasActivas = useSelector(
        (state) => state.visitasActivas.value,
        shallowEqual
    );

    // Estado del modal
    const [show, setShow] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    // Filtrar visitas de la mesa actual
    const visitasMesa = useMemo(() => {
        if (!visitasActivas || visitasActivas.length === 0) return [];
        return visitasActivas.filter(visita => visita.mesa?.numero === datosMesa.numeroMesa);
    }, [visitasActivas, datosMesa.numeroMesa]);

    // Calcular productos disponibles para pagar (no pagados)
    const productosAPagar = useMemo(() => {
        if (!visitasMesa[0]?.productos) return [];
        return visitasMesa[0].productos
            .filter(producto => !producto.estadoPagado)
            .map(producto => producto.id);
    }, [visitasMesa]);

    // Calcular total de productos pendientes
    const totalPedidos = useMemo(() => {
        if (!visitasMesa[0]?.productos) return 0;
        return visitasMesa[0].productos
            .filter(producto => !producto.estadoPagado)
            .reduce((acc, producto) => acc + (producto.precio || producto.precioDelMomento || 0), 0);
    }, [visitasMesa]);

    // Calcular cantidad de productos
    const cantidadItems = useMemo(() => {
        return visitasMesa[0]?.productos?.length ?? 0;
    }, [visitasMesa]);

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

        // Actualizar el estado de visitasActivas en Redux - marcar productos como pagados
        dispatch(cambiarEstadoPagadoProductos({ idsProductos: arregloIds, pagado: true }));

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
        visitasMesa,
        productosAPagar,
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

