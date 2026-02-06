import { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { PagarProductosVisita } from '../../../../API/APIVisitas';
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

    // Obtener la visita de la mesa actual
    const visitaMesa = useMemo(() => {
        if (!visitasActivas || visitasActivas.length === 0) return null;
        return visitasActivas.find(visita => visita.mesa?.numero === datosMesa.nombre || visita.numeroMesa === datosMesa.nombre) || null;
    }, [visitasActivas, datosMesa.nombre]);

    // Calcular productos disponibles para pagar (no pagados)
    const productosAPagar = useMemo(() => {
        if (!visitaMesa?.productosConsumidos) return [];
        return visitaMesa.productosConsumidos
            .filter(producto => !producto.estadoPagado)
            .map(producto => producto.id);
    }, [visitaMesa]);

    // Calcular total de productos pendientes
    const totalPedidos = useMemo(() => {
        if (!visitaMesa?.productosConsumidos) return 0;
        return visitaMesa.productosConsumidos
            .filter(producto => !producto.estadoPagado)
            .reduce((acc, producto) => acc + (producto.precio || producto.precioDelMomento || 0), 0);
    }, [visitaMesa]);

    // Calcular cantidad de productos
    const cantidadItems = useMemo(() => {
        return visitaMesa?.productosConsumidos?.length ?? 0;
    }, [visitaMesa]);

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

    // Función para pagar/facturar productos (usada tanto para "Facturar todo" como para "Facturar ticket")
    const PagarMesa = useCallback(async (arregloIds) => {
        if (!arregloIds || arregloIds.length === 0) {
            alert("No hay productos para facturar");
            return;
        }

        const idVisita = visitaMesa?.id;
        if (!idVisita) {
            alert("No se pudo identificar la visita de la mesa");
            return;
        }

        try {
            // Marcar productos como pagados en la DB (endpoint Visitas/Pagar)
            await PagarProductosVisita(idVisita, arregloIds);

            // Generar la factura PDF
            GenerarTicketPDF(datosMesa.nombre, arregloIds);

            // Enviar mensaje al cliente para actualizar su cuenta
            connection.send("RecargarTicket", datosMesa.nombre);

            // Actualizar el estado de visitasActivas en Redux - marcar productos como pagados
            dispatch(cambiarEstadoPagadoProductos({ idsProductos: arregloIds, pagado: true }));

            // Si hay un ticket en Redux con estos IDs, eliminarlo (ya fue facturado)
            dispatch(eliminarTicket(arregloIds));

            // Cambiar a la pestaña de "Pagos registrados" para mostrar los productos pagados
            setTabValue(2);

            alert("Productos facturados correctamente");
        } catch (error) {
            console.error("Error al facturar:", error);
            alert("Error al facturar. Intente de nuevo.");
        }
    }, [datosMesa.nombre, dispatch, visitaMesa?.id]);

    return {
        // Estado
        show,
        tabValue,
        visitaMesa,
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

