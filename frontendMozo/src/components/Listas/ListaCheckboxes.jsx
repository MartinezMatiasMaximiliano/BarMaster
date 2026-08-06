import { memo, useMemo } from 'react';
import { Typography, Box, Checkbox, Stack, Chip, Alert } from "@mui/material";
import { getEstadoColor, getNombre, getPrecio } from './helpers';

/** Lista de productos pendientes con checkboxes para seleccionar cuáles facturar */
function ListaCheckboxes({
    productos,
    titulo,
    subtitulo,
    currencyFormatter,
    productosSeleccionados,
    onToggleProducto
}) {
    const total = useMemo(() =>
        productos.reduce((acc, p) => acc + getPrecio(p), 0),
        [productos]
    );

    const formatPrecio = (precio) =>
        currencyFormatter ? currencyFormatter.format(precio) : `$${precio}`;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexShrink: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {titulo}
                </Typography>
                <Alert severity="success" sx={{ py: 0.5, px: 1.5 }}>
                    <b>{subtitulo}</b>: {formatPrecio(total)}
                </Alert>
            </Stack>
            <Box sx={{ flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
                {productos.map((producto) => {
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
                                mb: 0.5, py: 0.5, px: 1,
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
                                    onClick={(e) => e.stopPropagation()}
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
            </Box>
        </Box>
    );
}

export default memo(ListaCheckboxes);
