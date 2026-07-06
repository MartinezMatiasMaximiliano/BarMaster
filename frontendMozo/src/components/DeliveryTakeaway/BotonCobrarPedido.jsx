import React, { useMemo, useState, useCallback } from 'react';
import { Button } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useDispatch } from 'react-redux';
import Modal_Facturar from '../Modals/Modal_Facturar/Modal_Facturar';
import { PagarItems } from '../../API/APIPagos';
import { useSnackbar } from '../../hooks/useSnackbar.jsx';
import { cambiarEstadoPagadoProductos } from '../../redux/slices/visitasActivasSlice';
import { sendHubMessage } from '../../connections/HubConnMozo';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
});

export default function BotonCobrarPedido({
    pedido,
    disabled = false,
    onSuccess,
    titulo = 'Cobrar pedido',
}) {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const { showSnackbar, SnackbarComponent } = useSnackbar();

    const productos = Array.isArray(pedido?.Productos) ? pedido.Productos : [];
    const productosPendientes = useMemo(
        () => productos.filter((producto) => !producto.estadoPagado),
        [productos]
    );
    const productIds = useMemo(
        () => productosPendientes.map((producto) => producto.id).filter((id) => id != null),
        [productosPendientes]
    );
    const totalProductosPendientes = useMemo(
        () => productosPendientes.reduce((acc, producto) => acc + (Number(producto.precio) || 0), 0),
        [productosPendientes]
    );
    const hayProductosPagados = productos.some((producto) => producto.estadoPagado);
    const precioEnvio = !hayProductosPagados ? Number(pedido?.PrecioEnvio || 0) : 0;
    const total = totalProductosPendientes + precioEnvio;
    const idVisita = pedido?.idVisita;
    const puedeCobrar = !disabled && Boolean(idVisita) && productIds.length > 0;

    const handleConfirmar = useCallback(async (idsProductos, idTipoPago, monto) => {
        if (!idVisita) {
            showSnackbar('No se pudo identificar la visita del pedido', 'error');
            return;
        }

        try {
            const pagoCreado = await PagarItems(idVisita, idsProductos, idTipoPago, monto);
            const idMovimientoCaja = pagoCreado?.id || pagoCreado?.Id;
            dispatch(cambiarEstadoPagadoProductos({ idsProductos, pagado: true, idMovimientoCaja }));
            await sendHubMessage('RecargarDeliveryTakeaway');
            showSnackbar('Pedido cobrado correctamente', 'success');
            setOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error al cobrar pedido:', error);
            const msg = error.response?.data;
            showSnackbar(typeof msg === 'string' ? msg : 'Error al cobrar el pedido. Intente de nuevo.', 'error');
        }
    }, [dispatch, idVisita, onSuccess, showSnackbar]);

    return (
        <>
            <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<ReceiptIcon />}
                disabled={!puedeCobrar}
                onClick={() => setOpen(true)}
            >
                Cobrar
            </Button>
            <Modal_Facturar
                open={open}
                onClose={() => setOpen(false)}
                titulo={titulo}
                total={total}
                productIds={productIds}
                currencyFormatter={currencyFormatter}
                onConfirm={handleConfirmar}
            />
            <SnackbarComponent />
        </>
    );
}
