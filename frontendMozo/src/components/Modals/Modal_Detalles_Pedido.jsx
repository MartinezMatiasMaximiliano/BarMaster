import { Box, Divider, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function Modal_Detalles_Pedido(props) {
    const items = Array.isArray(props.cuerpo) ? props.cuerpo : [];
    const totalProductos = items.reduce((sum, p) => sum + (Number(p.precio) || 0), 0);
    const precioEnvio = Number(props.precioEnvio || 0);
    const totalPedido = props.precioTotal != null
        ? Number(props.precioTotal)
        : totalProductos + precioEnvio;
    const formatearPrecio = (valor) => `$${Number(valor || 0).toLocaleString('es-AR')}`;
    const productosAgrupados = Array.from(
        items.reduce((map, item) => {
            const precioUnitario = Number(item.precio || 0);
            const key = [
                item.idProducto ?? item.id ?? item.nombre ?? 'producto',
                item.nombre ?? 'Producto',
                precioUnitario,
                item.indicaciones ?? '',
            ].join('|');
            const existente = map.get(key);

            if (existente) {
                existente.cantidad += 1;
                existente.total += precioUnitario;
                return map;
            }

            map.set(key, {
                id: item.idProducto ?? item.id ?? key,
                nombre: item.nombre || 'Producto',
                indicaciones: item.indicaciones || '',
                precioUnitario,
                cantidad: 1,
                total: precioUnitario,
            });
            return map;
        }, new Map()).values()
    );
    const resumenPedido = (
        <Box sx={{ width: 340, maxWidth: '80vw' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Resumen del pedido
            </Typography>
            {items.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    Sin productos
                </Typography>
            ) : (
                <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
                    {productosAgrupados.map((item, index) => (
                        <Box
                            key={`${item.id}-${item.precioUnitario}-${item.indicaciones}-${index}`}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: 1.5,
                                py: 0.75,
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {item.cantidad}x {item.nombre} <Typography component="span" variant="caption" color="text.secondary">({`1x ${formatearPrecio(item.precioUnitario)}`})</Typography>
                                </Typography>
                                {item.indicaciones && (
                                    <Typography variant="caption" color="text.secondary">
                                        {item.indicaciones}
                                    </Typography>
                                )}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {formatearPrecio(item.total)}
                            </Typography>
                        </Box>
                    ))}
                    {precioEnvio > 0 && (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: 1.5,
                                py: 0.75,
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Envío
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {formatearPrecio(precioEnvio)}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
            <Divider sx={{ my: 1.25 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Total
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {formatearPrecio(totalPedido)}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Tooltip
            title={resumenPedido}
            arrow
            placement="top"
            enterDelay={200}
            slotProps={{
                tooltip: {
                    sx: {
                        maxWidth: 'none',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 1.25,
                    },
                },
                arrow: {
                    sx: {
                        color: 'background.paper',
                    },
                },
            }}
        >
            <Typography
                component="span"
                variant="body2"
                fontWeight={600}
                tabIndex={0}
                sx={{ cursor: 'help' }}
            >
                <InfoOutlinedIcon
                    color="info"
                    sx={{ fontSize: 17, verticalAlign: 'text-bottom' }}
                />Ver
            </Typography>
        </Tooltip>
    );
}

export default Modal_Detalles_Pedido;
