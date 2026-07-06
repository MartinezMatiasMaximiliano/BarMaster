// components/Mesa/MesaModalUnificado.jsx
import React, { useCallback, useMemo, useState } from 'react';
import {
    Box,
    Dialog,
    DialogContent,
    Stack,
    Tab,
    Tabs,
    Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import Modal_Generico from '../Modals/Modal_Generico';
import Modal_Facturar from '../Modals/Modal_Facturar/Modal_Facturar';
import { useAgregarPedidos } from '../Modals/Agregar_Pedidos/hooks/useAgregarPedidos';
import { SnackbarWrapper } from '../common/SnackbarWrapper';
import { useSnackbar } from '../../hooks/useSnackbar.jsx';
import { useModalVerCuenta } from '../Modals/Modal_Ver_Cuenta/hooks/useModalVerCuenta';
import TabContent from '../Modals/Modal_Ver_Cuenta/components/TabContent';
import { MesaModalActions } from './components/MesaModalActions';
import { MesaModalHeader } from './components/MesaModalHeader';
import { MesaProductosPanel } from './components/MesaProductosPanel';
import { PedidoTotalMesa } from './components/PedidoTotalMesa';
import { useAutoSubmitPedidos } from './hooks/useAutoSubmitPedidos';
import { boxDividerLine } from '../../styles/boxStyles';
import { formatearFecha } from './dateFormatter';

const AUTO_SUBMIT_MS = 5000;

export const MesaModalUnificado = ({
    show,
    handleClose,
    datos_mesa,
    visitaMesa,
    onCancelarPedidos,
    onCerrarMesa
}) => {
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const {
        tabValue,
        visitaMesa: visitaMesaCuenta,
        productosAPagar,
        totalPedidos,
        currencyFormatter,
        handleTabChange,
        PagarMesa
    } = useModalVerCuenta(datos_mesa, handleClose, { tabIndexPagosRegistrados: 1 });

    const visitaMesaFinal = visitaMesaCuenta || visitaMesa;
    const idVisita = visitaMesaFinal?.id || visitaMesaFinal?.Id || datos_mesa.visita?.id || datos_mesa.visita?.Id;
    const fechaFormateada = formatearFecha(visitaMesaFinal?.fechaHora || datos_mesa.visita?.fechaHora);

    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [showModalFacturar, setShowModalFacturar] = useState(null);
    const [snackbarFacturacion, setSnackbarFacturacion] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    const {
        productos,
        categorias,
        productosFiltrados,
        comanda,
        busqueda,
        categoriaFiltro,
        loading,
        totalItems,
        snackbar,
        setBusqueda,
        setCategoriaFiltro,
        agregarAComanda,
        actualizarCantidad,
        actualizarIndicaciones,
        handleEnviarPedidos,
        limpiarEstado,
        closeSnackbar
    } = useAgregarPedidos(show, idVisita, datos_mesa.nombre, () => {});

    const hayPedidosPendientes = productosAPagar.length > 0;
    const hayPedidosProvisorios = comanda.length > 0;
    const bloquearCerrarMesa = hayPedidosPendientes || hayPedidosProvisorios || loading;
    const motivoBloqueoCerrarMesa = hayPedidosPendientes
        ? 'Facturá o cancelá los pedidos pendientes antes de cerrar la mesa'
        : hayPedidosProvisorios
            ? 'Agregá o quitá los productos provisorios antes de cerrar la mesa'
            : loading
                ? 'Esperá a que termine el envío de pedidos antes de cerrar la mesa'
                : '';

    const autoSubmitPedidos = useAutoSubmitPedidos({
        activo: show && Boolean(idVisita) && comanda.length > 0,
        duracionMs: AUTO_SUBMIT_MS,
        bloqueado: loading,
        resetKey: comanda,
        onSubmit: handleEnviarPedidos
    });

    const totalPartes = useMemo(() => {
        if (!visitaMesaFinal?.productosConsumidos || productosSeleccionados.length === 0) return 0;
        return visitaMesaFinal.productosConsumidos
            .filter(p => productosSeleccionados.includes(p.id))
            .reduce((acc, p) => acc + (p.precio || p.precioDelMomento || 0), 0);
    }, [visitaMesaFinal, productosSeleccionados]);

    const showSnackbarFacturacion = useCallback((message, severity = 'info') => {
        setSnackbarFacturacion({ open: true, message, severity });
    }, []);

    const handleCloseSnackbarFacturacion = useCallback(() => {
        setSnackbarFacturacion(prev => ({ ...prev, open: false }));
    }, []);

    const handleToggleProducto = useCallback((productoId) => {
        setProductosSeleccionados(prev =>
            prev.includes(productoId)
                ? prev.filter(id => id !== productoId)
                : [...prev, productoId]
        );
    }, []);

    const handleConfirmarFacturacion = useCallback((arregloIds, idTipoPago, monto) => {
        PagarMesa(arregloIds, showSnackbarFacturacion, idTipoPago != null && monto != null ? { idTipoPago, monto } : undefined);
        setProductosSeleccionados([]);
        setShowModalFacturar(null);
    }, [PagarMesa, showSnackbarFacturacion]);

    const handleFacturarPartes = useCallback(() => {
        if (productosSeleccionados.length === 0) {
            showSnackbarFacturacion('Por favor, seleccione al menos un producto para facturar', 'warning');
            return;
        }

        setShowModalFacturar('partes');
    }, [productosSeleccionados.length, showSnackbarFacturacion]);

    const handleCloseWithCleanup = useCallback(() => {
        setProductosSeleccionados([]);
        autoSubmitPedidos.reset();

        if (comanda.length > 0 && idVisita && !loading) {
            handleEnviarPedidos();
        } else if (!loading) {
            limpiarEstado();
        }

        handleClose();
    }, [autoSubmitPedidos, comanda.length, handleClose, handleEnviarPedidos, idVisita, limpiarEstado, loading]);

    const handleIndicacionesEnCargaChange = useCallback((productoId, indicaciones) => {
        actualizarIndicaciones(productoId, indicaciones);
        autoSubmitPedidos.pause();
    }, [actualizarIndicaciones, autoSubmitPedidos]);

    const handleCancelarPedidosConSnackbar = useCallback((idsProductos) => {
        if (!idsProductos || idsProductos.length === 0) {
            showSnackbar('Por favor, seleccione al menos un pedido para cancelar', 'warning');
            return;
        }

        onCancelarPedidos(idsProductos);
        setProductosSeleccionados([]);

        const cantidad = idsProductos.length;
        showSnackbar(
            `Se ${cantidad === 1 ? 'canceló' : 'cancelaron'} ${cantidad} ${cantidad === 1 ? 'pedido' : 'pedidos'} correctamente`,
            'success'
        );
    }, [onCancelarPedidos, showSnackbar]);

    return (
        <Dialog
            open={show}
            onClose={handleCloseWithCleanup}
            maxWidth="xl"
            fullWidth
            disableEnforceFocus
            PaperProps={{ sx: { borderRadius: 3, height: '92vh', overflow: 'hidden', bgcolor: '#f3f6f9' } }}
        >
            <MesaModalHeader
                fecha={fechaFormateada}
                numeroMesa={datos_mesa.nombre}
                onClose={handleCloseWithCleanup}
            />

            <DialogContent sx={{ p: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#f3f6f9' }}>
                <Box
                    sx={{
                        flex: 1,
                        paddingTop: 4,
                        minHeight: 0,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'minmax(420px, 0.9fr) minmax(0, 1.4fr)' },
                        gap: 2,
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ minHeight: 0, bgcolor: '#ffffff', borderRadius: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} sx={{ ...boxDividerLine, px: 2, flexShrink: 0 }}>
                            <Tab label="Resumen" icon={<RestaurantMenuIcon />} iconPosition="start" />
                            <Tab label="Pagos registrados" icon={<CheckCircleIcon />} iconPosition="start" disabled={!visitaMesaFinal} />
                        </Tabs>

                        <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, bgcolor: '#ffffff' }}>
                            <Tooltip title={motivoBloqueoCerrarMesa}>
                                <span style={{ display: 'inline-flex' }}>
                                    <Modal_Generico
                                        confirmar={true}
                                        titulo="¿Seguro que desea cerrar la mesa?"
                                        cuerpo="Todos los pedidos pendientes se marcarán como pagados"
                                        textoBoton="Cerrar Mesa"
                                        func={onCerrarMesa}
                                        param={datos_mesa.id}
                                        cerrar_modal={handleCloseWithCleanup}
                                        disabled={bloquearCerrarMesa}
                                        buttonSize="small"
                                    />
                                </span>
                            </Tooltip>
                            <Modal_Generico
                                confirmar={true}
                                titulo="Cancelar pedidos"
                                cuerpo="¿Seguro que desea cancelar los pedidos?"
                                textoBoton={`Cancelar Pedidos${productosSeleccionados.length > 0 ? ` (${productosSeleccionados.length})` : ''}`}
                                func={handleCancelarPedidosConSnackbar}
                                param={productosSeleccionados}
                                cerrar_modal={handleCloseWithCleanup}
                                disabled={productosSeleccionados.length === 0}
                                buttonSize="small"
                            />
                        </Box>

                        <Box sx={{ p: 2, pt: 1, flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
                            {tabValue === 0 && (
                                <PedidoTotalMesa
                                    visitaMesa={visitaMesaFinal}
                                    titulo="Pedido total"
                                    subtitulo="Total"
                                    productosSeleccionados={productosSeleccionados}
                                    onToggleProducto={handleToggleProducto}
                                    currencyFormatter={currencyFormatter}
                                    productosProvisorios={comanda}
                                    onActualizarCantidadProvisoria={actualizarCantidad}
                                    onActualizarIndicacionesProvisorias={handleIndicacionesEnCargaChange}
                                    onFocusIndicacionesProvisorias={autoSubmitPedidos.pause}
                                    onBlurIndicacionesProvisorias={autoSubmitPedidos.resume}
                                    autoSubmit={{
                                        remainingMs: autoSubmitPedidos.remainingMs,
                                        durationMs: AUTO_SUBMIT_MS,
                                        paused: autoSubmitPedidos.paused,
                                        complete: autoSubmitPedidos.complete
                                    }}
                                />
                            )}
                            {tabValue === 1 && (
                                <TabContent
                                    visitaMesa={visitaMesaFinal}
                                    estado={2}
                                    titulo="Pagado"
                                    subtitulo="Subtotal"
                                    surfaceVariant
                                />
                            )}
                        </Box>
                    </Box>

                    <MesaProductosPanel
                        idVisita={idVisita}
                        productos={productos}
                        categorias={categorias}
                        productosFiltrados={productosFiltrados}
                        busqueda={busqueda}
                        categoriaFiltro={categoriaFiltro}
                        onBusquedaChange={setBusqueda}
                        onCategoriaChange={setCategoriaFiltro}
                        onAgregarProducto={agregarAComanda}
                    />
                </Box>
            </DialogContent>

            <MesaModalActions
                puedeFacturarTodo={productosAPagar.length > 0}
                productosSeleccionadosCount={productosSeleccionados.length}
                puedeAgregarPedidos={comanda.length > 0 && !loading && Boolean(idVisita)}
                loading={loading}
                totalItems={totalItems}
                onFacturarTodo={() => setShowModalFacturar('todo')}
                onFacturarPartes={handleFacturarPartes}
                onAgregarPedidos={handleEnviarPedidos}
                onClose={handleCloseWithCleanup}
            />

            <SnackbarComponent />
            <SnackbarWrapper
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={closeSnackbar}
            />
            <SnackbarWrapper
                open={snackbarFacturacion.open}
                message={snackbarFacturacion.message}
                severity={snackbarFacturacion.severity}
                onClose={handleCloseSnackbarFacturacion}
            />

            {showModalFacturar === 'todo' && (
                <Modal_Facturar
                    open={true}
                    onClose={() => setShowModalFacturar(null)}
                    titulo="Facturar todo"
                    total={totalPedidos}
                    productIds={productosAPagar}
                    currencyFormatter={currencyFormatter}
                    onConfirm={handleConfirmarFacturacion}
                />
            )}
            {showModalFacturar === 'partes' && (
                <Modal_Facturar
                    open={true}
                    onClose={() => setShowModalFacturar(null)}
                    titulo="Facturar por partes"
                    total={totalPartes}
                    productIds={productosSeleccionados}
                    currencyFormatter={currencyFormatter}
                    onConfirm={handleConfirmarFacturacion}
                />
            )}
        </Dialog>
    );
};
