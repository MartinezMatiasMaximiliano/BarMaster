import { useMemo, memo } from 'react';
import Alert from '@mui/material/Alert';
import { Typography, Box, Checkbox, Stack, Chip } from "@mui/material";
import { useSelector } from 'react-redux';
import Modal_Generico from '../Modals/Modal_Generico';

function Lista_Items(props) {
    const ticket = useSelector((state) => state.ticket.value);

    // Función helper para obtener el color del estado
    const getEstadoColor = (estadoPedido) => {
        if (!estadoPedido) return 'default';
        if (estadoPedido === 'Listo') return 'success';
        if (estadoPedido === 'En Preparación') return 'info';
        return 'default';
    };

    const mensajeListaVacia = useMemo(() => (
        <div className="mb-0">
            <h4>{props.titulo}</h4>
            <p>No hay items para mostrar. Los tickets enviados por los clientes aparecerán aquí</p>
        </div>
    ), [props.titulo]);

    const res = useMemo(() => {
        if (props.estado === 1) {
            // Generar resumen por ticket
            if (!props.visitaMesa || !props.visitaMesa.productosConsumidos || !ticket || ticket.length === 0) {
                return mensajeListaVacia;
            }

            const todosLosProductos = props.visitaMesa.productosConsumidos || [];
            const productosPorTicket = ticket.map(idsGrupo =>
                todosLosProductos.filter(producto => idsGrupo.includes(producto.id))
            );
            const productosPorTicketFiltrados = productosPorTicket.filter(grupo => grupo.length > 0);

            const resumenPorTicket = productosPorTicketFiltrados.map((grupoProductos, indexTicket) => {
                const resumen = {};
                let total = 0;

                grupoProductos.forEach(producto => {
                    const nombre = producto.nombre || producto.nombreProducto;
                    const precio = producto.precio || producto.precioDelMomento;
                    const estadoPedido = producto.estadoPedido;
                    
                    if (resumen[nombre]) {
                        resumen[nombre].cantidad++;
                        resumen[nombre].total += precio;
                        // Si hay diferentes estados, marcar como mixto
                        if (resumen[nombre].estadoPedido && resumen[nombre].estadoPedido !== estadoPedido) {
                            resumen[nombre].estadoPedido = 'Mixto';
                        } else if (!resumen[nombre].estadoPedido) {
                            resumen[nombre].estadoPedido = estadoPedido;
                        }
                    } else {
                        resumen[nombre] = {
                            precioUnitario: precio,
                            cantidad: 1,
                            total: precio,
                            estadoPedido: estadoPedido
                        };
                    }
                    total += precio;
                });

                return (
                    <div key={indexTicket}>
                        <Box key={indexTicket} sx={{ mb: 2 }}>
                            <h4>Ticket #{indexTicket + 1}</h4>
                            {Object.entries(resumen).map(([nombre, data], index) => {
                                const estadoPedido = data.estadoPedido;
                                return (
                                    <Box
                                        key={index}
                                        sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}
                                    >
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {`${data.cantidad}x ${nombre} ($${data.precioUnitario} x1)`}
                                            {estadoPedido && (
                                                <Chip 
                                                    label={estadoPedido} 
                                                    size="small" 
                                                    color={getEstadoColor(estadoPedido)}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                            )}
                                        </Typography>
                                        <Typography variant="body2">
                                            ${data.total}
                                        </Typography>
                                    </Box>
                                );
                            })}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mt: 1 }}>
                                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', mr: 2 }}>
                                    Total: ${total}
                                </Typography>
                                {props.facturar && <Modal_Generico variant="outline-primary" textoBoton="Facturar ticket" titulo="Facturar ticket" cuerpo="¿Confirmar la accion?" confirmar={true} func={props.PagarMesa} param={productosPorTicketFiltrados[indexTicket].map(producto => producto.id)}></Modal_Generico>}
                            </Box>
                        </Box>
                        {indexTicket !== productosPorTicketFiltrados.length - 1 && (
                            <hr className="w-50 mx-auto" />
                        )}
                    </div>
                );
            });

            return (resumenPorTicket.length > 0 ? resumenPorTicket : mensajeListaVacia);
        } else {
            // Generar resumen normal
            if (!props.visitaMesa || !props.visitaMesa.productosConsumidos) {
                return mensajeListaVacia;
            }

            const estado = props.estado;
            const resumen = {};
            let total = 0;
            
            // Si estado === 2, mostrar productos pagados (estadoPagado === true)
            // Si estado === false, mostrar todos los productos
            // Si estado es otro número, filtrar por estadoPreparacion
            const productosCorrespondientes = estado === 2
                ? props.visitaMesa.productosConsumidos.filter(producto => producto.estadoPagado === true)
                : estado === false
                ? props.visitaMesa.productosConsumidos
                : props.visitaMesa.productosConsumidos.filter(producto => producto.estadoPreparacion === estado);

            // Si se muestran checkboxes (solo para resumen con productos pendientes)
            if (props.mostrarCheckboxes && estado === false) {
                // Filtrar solo productos pendientes
                const productosPendientes = productosCorrespondientes.filter(producto => !producto.estadoPagado);
                
                if (productosPendientes.length === 0) {
                    return mensajeListaVacia;
                }

                // Calcular total de productos pendientes
                productosPendientes.forEach(producto => {
                    total += (producto.precio || producto.precioDelMomento || 0);
                });

                let texto = productosPendientes.map((producto, index) => {
                    const nombre = producto.nombre || producto.nombreProducto;
                    const precio = producto.precio || producto.precioDelMomento || 0;
                    const estadoPedido = producto.estadoPedido;
                    const isSelected = props.productosSeleccionados?.includes(producto.id) || false;
                    const labelId = `checkbox-resumen-${producto.id}`;

                    return (
                        <Box
                            key={producto.id}
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                justifyContent: 'space-between', 
                                mb: 0.5,
                                py: 0.5,
                                px: 1,
                                borderRadius: 1,
                                bgcolor: isSelected ? 'action.selected' : 'transparent',
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                },
                                cursor: 'pointer'
                            }}
                            onClick={() => props.onToggleProducto?.(producto.id)}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Checkbox
                                    checked={isSelected}
                                    onChange={() => props.onToggleProducto?.(producto.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    size="small"
                                    sx={{ mr: 1 }}
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                                <Typography 
                                    variant="body2" 
                                    id={labelId}
                                    sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                    {nombre}
                                    {estadoPedido && (
                                        <Chip 
                                            label={estadoPedido} 
                                            size="small" 
                                            color={getEstadoColor(estadoPedido)}
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                    )}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', ml: 2 }}>
                                {props.currencyFormatter ? props.currencyFormatter.format(precio) : `$${precio}`}
                            </Typography>
                        </Box>
                    );
                });

                const resultado = (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%',
                        minHeight: 0
                    }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexShrink: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {props.titulo}
                            </Typography>
                            <Alert severity="success" sx={{ py: 0.5, px: 1.5 }}>
                                <b>{props.subtitulo}</b>: {props.currencyFormatter ? props.currencyFormatter.format(total) : `$${total}`}
                            </Alert>
                        </Stack>
                        <Box sx={{ 
                            flex: '1 1 auto',
                            overflowY: 'auto',
                            minHeight: 0
                        }}>
                            {texto}
                        </Box>
                    </Box>
                );

                return resultado;
            }

            // Resumen normal sin checkboxes (comportamiento original)
            // Solo mostrar EstadoPedido si NO es la tab de "Pagos Registrados" (estado === 2)
            const mostrarEstadoPedido = estado !== 2;
            
            productosCorrespondientes.forEach(producto => {
                const nombre = producto.nombre || producto.nombreProducto;
                const precio = producto.precio || producto.precioDelMomento;
                const estadoPedido = mostrarEstadoPedido ? producto.estadoPedido : null;
                
                if (resumen[nombre]) {
                    resumen[nombre].cantidad++;
                    resumen[nombre].total += precio;
                    // Si hay diferentes estados, marcar como mixto (solo si debemos mostrar el estado)
                    if (mostrarEstadoPedido) {
                        if (resumen[nombre].estadoPedido && resumen[nombre].estadoPedido !== estadoPedido) {
                            resumen[nombre].estadoPedido = 'Mixto';
                        } else if (!resumen[nombre].estadoPedido) {
                            resumen[nombre].estadoPedido = estadoPedido;
                        }
                    }
                } else {
                    resumen[nombre] = {
                        precioUnitario: precio,
                        cantidad: 1,
                        total: precio,
                        estadoPedido: mostrarEstadoPedido ? estadoPedido : null
                    };
                }
                total += precio;
            });

            let texto = Object.entries(resumen).map(([nombre, data], index) => {
                const estadoPedido = mostrarEstadoPedido ? data.estadoPedido : null;
                return (
                    <Box
                        key={index}
                        sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}
                    >
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {`${data.cantidad}x ${nombre} ($${data.precioUnitario} x1)`}
                            {estadoPedido && (
                                <Chip 
                                    label={estadoPedido} 
                                    size="small" 
                                    color={getEstadoColor(estadoPedido)}
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                        </Typography>
                        <Typography variant="body2">
                            ${data.total}
                        </Typography>
                    </Box>
                );
            });

            const resultado = <>
                <h4>{props.titulo}</h4>
                <pre>{texto}</pre>
                <Alert severity="success"><b>{props.subtitulo}</b>: ${total}</Alert>
            </>;

            return (total != 0 ? resultado : mensajeListaVacia);
        }
    }, [props.visitaMesa, props.estado, props.titulo, props.subtitulo, props.facturar, props.PagarMesa, props.mostrarCheckboxes, props.productosSeleccionados, props.onToggleProducto, props.currencyFormatter, ticket, mensajeListaVacia]);

    return res;
}

// Memoizar con comparador optimizado para Firefox
export default memo(Lista_Items, (prevProps, nextProps) => {
    if (prevProps.visitaMesa === nextProps.visitaMesa &&
        prevProps.estado === nextProps.estado &&
        prevProps.titulo === nextProps.titulo &&
        prevProps.subtitulo === nextProps.subtitulo &&
        prevProps.facturar === nextProps.facturar &&
        prevProps.PagarMesa === nextProps.PagarMesa &&
        prevProps.mostrarCheckboxes === nextProps.mostrarCheckboxes &&
        prevProps.productosSeleccionados === nextProps.productosSeleccionados &&
        prevProps.onToggleProducto === nextProps.onToggleProducto &&
        prevProps.currencyFormatter === nextProps.currencyFormatter) {
        return true;
    }
    return false;
});
