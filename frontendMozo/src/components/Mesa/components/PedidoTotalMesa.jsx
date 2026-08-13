import { useMemo } from 'react';
import { Alert, Box, Checkbox, Chip, Stack, Typography } from '@mui/material';
import { getEstadoColor, getNombre, getPrecio } from '../../Listas/helpers';
import { ProductoProvisorioItem } from './ProductoProvisorioItem';

export const PedidoTotalMesa = ({
    visitaMesa,
    titulo,
    subtitulo,
    currencyFormatter,
    productosSeleccionados,
    onToggleProducto,
    productosProvisorios,
    onActualizarCantidadProvisoria,
    onActualizarIndicacionesProvisorias,
    onFocusIndicacionesProvisorias,
    onBlurIndicacionesProvisorias,
    autoSubmit
}) => {
    const productosPendientes = useMemo(
        () => (visitaMesa?.productosConsumidos ?? []).filter(producto => !producto.estadoPagado),
        [visitaMesa]
    );

    const total = useMemo(() => {
        const totalPendiente = productosPendientes.reduce((acc, producto) => acc + getPrecio(producto), 0);
        const totalProvisorio = productosProvisorios.reduce(
            (acc, item) => acc + Number(item.producto?.precio || 0) * Number(item.cantidad || 0),
            0
        );
        return totalPendiente + totalProvisorio;
    }, [productosPendientes, productosProvisorios]);

    const formatPrecio = (precio) => currencyFormatter ? currencyFormatter.format(precio) : `$${precio}`;

    if (productosPendientes.length === 0 && productosProvisorios.length === 0) {
        return (
            <Box sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark'
                    ? theme.palette.primary.main
                    : '#cfe0ff',
                borderRadius: 2,
                p: 2
            }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    No hay items para mostrar. Los tickets enviados por los clientes aparecerán aquí
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 1.5 }}>
            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                    flexShrink: 0,
                    bgcolor: (theme) => theme.palette.mode === 'dark'
                        ? theme.palette.primary.main
                        : '#cfe0ff',
                    borderRadius: 2,
                    px: 2,
                    py: 1.5
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {titulo}
                </Typography>
                <Alert severity="success" sx={{ py: 0.5, px: 1.5 }}>
                    <b>{subtitulo}</b>: {formatPrecio(total)}
                </Alert>
            </Stack>

            <Box
                sx={{
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    minHeight: 0,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 1
                }}
            >
                {productosPendientes.map((producto) => {
                    const nombre = getNombre(producto);
                    const precio = getPrecio(producto);
                    const isSelected = productosSeleccionados?.includes(producto.id) || false;
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
                                '&:hover': { bgcolor: 'action.hover' },
                                cursor: 'pointer'
                            }}
                            onClick={() => onToggleProducto?.(producto.id)}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Checkbox
                                    checked={isSelected}
                                    onChange={() => onToggleProducto?.(producto.id)}
                                    onClick={(event) => event.stopPropagation()}
                                    size="small"
                                    sx={{ mr: 1 }}
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                                <Typography
                                    component="div"
                                    variant="body2"
                                    id={labelId}
                                    sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                    {nombre}
                                    {producto.estadoPedido && (
                                        <Chip
                                            label={producto.estadoPedido}
                                            size="small"
                                            color={getEstadoColor(producto.estadoPedido)}
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                    )}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', ml: 2 }}>
                                {formatPrecio(precio)}
                            </Typography>
                        </Box>
                    );
                })}

                {productosProvisorios.map((item) => (
                    <ProductoProvisorioItem
                        key={item.producto.id}
                        item={item}
                        formatPrecio={formatPrecio}
                        autoSubmit={autoSubmit}
                        onActualizarCantidad={onActualizarCantidadProvisoria}
                        onActualizarIndicaciones={onActualizarIndicacionesProvisorias}
                        onFocusIndicaciones={onFocusIndicacionesProvisorias}
                        onBlurIndicaciones={onBlurIndicacionesProvisorias}
                    />
                ))}
            </Box>
        </Box>
    );
};
