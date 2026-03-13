import { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { PagarItems } from '../../../../API/APIPagos';
import { BuscarTipoMovimientosPorEntorno } from '../../../../API/APITipoMovimientosCaja';
import { GenerarTicketPDF } from '../../../../API/APIPedidos';
import { cambiarEstadoPagadoProductos } from '../../../../redux/slices/visitasActivasSlice';
import { eliminar as eliminarTicket } from '../../../../redux/slices/ticketSlice';
import connection from '../../../../connections/HubConnMozo';

/**
 * Hook personalizado para manejar toda la lógica de negocio del modal Ver Cuenta
 * Centraliza el estado, cálculos y acciones relacionadas con la cuenta de una mesa
 * @param {object} options - Opcional. tabIndexPagosRegistrados: índice de la tab "Pagos registrados" (Modal_Ver_Cuenta=2, MesaModal=1)
 */
export const useModalVerCuenta = (datosMesa, cerrarModalMesa, options) => {
    const tabIndexPagosRegistrados = options?.tabIndexPagosRegistrados ?? 2;
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
    // opciones: { idTipoPago, monto } opcional; si no se pasa, se usa el primer tipo de pago y el total de los productos
    const PagarMesa = useCallback(async (arregloIds, showSnackbar, opciones) => {
        if (!arregloIds || arregloIds.length === 0) {
            if (showSnackbar) {
                showSnackbar("No hay productos para facturar", "warning");
            }
            return;
        }

        const idVisita = visitaMesa?.id || visitaMesa?.Id || datosMesa.visita?.id || datosMesa.visita?.Id;
        if (!idVisita) {
            if (showSnackbar) {
                showSnackbar("No se pudo identificar la visita de la mesa", "error");
            }
            return;
        }

        try {
            let idTipoPago = opciones?.idTipoPago;
            let monto = opciones?.monto;

            if (idTipoPago == null || monto == null) {
                const productosAPagarList = visitaMesa?.productosConsumidos?.filter(p => arregloIds.includes(p.id)) ?? [];
                const totalProductos = productosAPagarList.reduce(
                    (acc, p) => acc + (p.precio ?? p.precioDelMomento ?? 0),
                    0
                );
                monto = totalProductos;
                const dataTipos = await BuscarTipoMovimientosPorEntorno('Ventas');
                const lista = Array.isArray(dataTipos) ? dataTipos : (dataTipos?.data ?? []);
                const primer = lista[0];
                idTipoPago = primer?.id ?? primer?.Id ?? 1;
            }

            const pagoCreado = await PagarItems(idVisita, arregloIds, idTipoPago, monto);
            const idMovimientoCaja = pagoCreado?.id || pagoCreado?.Id;

            GenerarTicketPDF(datosMesa.nombre, arregloIds);
            connection.send("RecargarTicket", datosMesa.nombre);
            dispatch(cambiarEstadoPagadoProductos({ idsProductos: arregloIds, pagado: true, idMovimientoCaja }));
            dispatch(eliminarTicket(arregloIds));
            setTabValue(tabIndexPagosRegistrados);

            if (showSnackbar) {
                showSnackbar("Productos facturados correctamente", "success");
            }
        } catch (error) {
            console.error("Error al facturar:", error);
            if (showSnackbar) {
                showSnackbar(error.response?.data ?? "Error al facturar. Intente de nuevo.", "error");
            }
        }
    }, [datosMesa.nombre, dispatch, visitaMesa?.id, visitaMesa?.productosConsumidos, tabIndexPagosRegistrados]);

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

