import { memo, useMemo } from 'react';
import { Typography, Box, Chip, Alert } from "@mui/material";
import { getEstadoColor, getNombre, getPrecio } from './helpers';

const ordenEstado = (data) => {
    if (data.pagado) return 0;
    const e = data.estadoPedido || '';
    if (e === 'Listo') return 1;
    if (e === 'En Preparación') return 2;
    if (e === 'Pendiente') return 3;
    return 4;
};

/** Agrupa productos por nombre+estado y calcula totales */
function useResumenAgrupado(productos) {
    return useMemo(() => {
        const resumen = {};
        let total = 0;

        productos.forEach(producto => {
            const nombre = getNombre(producto);
            const precio = getPrecio(producto);
            const pagado = producto.estadoPagado === true;
            const estadoPedido = !pagado ? (producto.estadoPedido ?? '') : '';
            const clave = `${nombre}|${pagado}|${estadoPedido}`;

            if (resumen[clave]) {
                resumen[clave].cantidad++;
                resumen[clave].total += precio;
            } else {
                resumen[clave] = {
                    nombreDisplay: nombre,
                    precioUnitario: precio,
                    cantidad: 1,
                    total: precio,
                    estadoPedido: estadoPedido || null,
                    pagado
                };
            }
            total += precio;
        });

        const entradas = Object.entries(resumen).sort(
            (a, b) => ordenEstado(a[1]) - ordenEstado(b[1])
        );

        return { entradas, total };
    }, [productos]);
}

/** Resumen normal de productos agrupados por nombre, con chips de estado */
function ListaResumen({ productos, titulo, subtitulo }) {
    const { entradas, total } = useResumenAgrupado(productos);

    if (total === 0) return null;

    return (
        <>
            <h4>{titulo}</h4>
            <Box>
                {entradas.map(([clave, data]) => (
                    <Box
                        key={clave}
                        sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}
                    >
                        <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {`${data.cantidad}x ${data.nombreDisplay} ($${data.precioUnitario} x1)`}
                            {data.pagado && (
                                <Chip
                                    label="Pagado"
                                    size="small"
                                    color="success"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                            {data.estadoPedido && (
                                <Chip
                                    label={data.estadoPedido}
                                    size="small"
                                    color={getEstadoColor(data.estadoPedido)}
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                        </Typography>
                        <Typography variant="body2">
                            ${data.total}
                        </Typography>
                    </Box>
                ))}
            </Box>
            <Alert severity="success"><b>{subtitulo}</b>: ${total}</Alert>
        </>
    );
}

export default memo(ListaResumen);
