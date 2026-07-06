import { useMemo, memo } from 'react';
import { Box, Typography } from '@mui/material';
import ListaCheckboxes from './ListaCheckboxes';
import ListaPagosRegistrados from './ListaPagosRegistrados';
import ListaResumen from './ListaResumen';

const mensajeVacio = (titulo, surfaceVariant = false) => surfaceVariant ? (
    <Box sx={{ bgcolor: '#f7f9fc', borderRadius: 2, p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            No hay items para mostrar. Los tickets enviados por los clientes aparecerán aquí
        </Typography>
    </Box>
) : (
    <div className="mb-0">
        <h4>{titulo}</h4>
        <p>No hay items para mostrar. Los tickets enviados por los clientes aparecerán aquí</p>
    </div>
);

function Lista_Items(props) {
    const productosConsumidos = props.visitaMesa?.productosConsumidos;
    const estado = props.estado;

    // Filtrar productos según el estado solicitado
    const productosFiltrados = useMemo(() => {
        if (!productosConsumidos) return [];

        if (estado === 2) return productosConsumidos.filter(p => p.estadoPagado === true);
        if (estado === false) return productosConsumidos;
        return productosConsumidos.filter(p => p.estadoPreparacion === estado);
    }, [productosConsumidos, estado]);

    // Sin datos
    if (!productosConsumidos) {
        return mensajeVacio(props.titulo, props.surfaceVariant);
    }

    // Modo checkboxes: productos pendientes para facturar
    if (props.mostrarCheckboxes && estado === false) {
        const productosPendientes = productosFiltrados.filter(p => !p.estadoPagado);
        if (productosPendientes.length === 0) return mensajeVacio(props.titulo);

        return (
            <ListaCheckboxes
                productos={productosPendientes}
                titulo={props.titulo}
                subtitulo={props.subtitulo}
                currencyFormatter={props.currencyFormatter}
                productosSeleccionados={props.productosSeleccionados}
                onToggleProducto={props.onToggleProducto}
            />
        );
    }

    // Pagos registrados: agrupados por ticket
    if (estado === 2) {
        if (productosFiltrados.length === 0) return mensajeVacio(props.titulo, props.surfaceVariant);
        return <ListaPagosRegistrados productos={productosFiltrados} surfaceVariant={props.surfaceVariant} />;
    }

    // Resumen normal
    if (productosFiltrados.length === 0) return mensajeVacio(props.titulo);

    return (
        <ListaResumen
            productos={productosFiltrados}
            titulo={props.titulo}
            subtitulo={props.subtitulo}
        />
    );
}

// Memoizar con comparador optimizado para Firefox
export default memo(Lista_Items, (prevProps, nextProps) => {
    return (
        prevProps.visitaMesa === nextProps.visitaMesa &&
        prevProps.estado === nextProps.estado &&
        prevProps.titulo === nextProps.titulo &&
        prevProps.subtitulo === nextProps.subtitulo &&
        prevProps.facturar === nextProps.facturar &&
        prevProps.PagarMesa === nextProps.PagarMesa &&
        prevProps.mostrarCheckboxes === nextProps.mostrarCheckboxes &&
        prevProps.productosSeleccionados === nextProps.productosSeleccionados &&
            prevProps.onToggleProducto === nextProps.onToggleProducto &&
        prevProps.currencyFormatter === nextProps.currencyFormatter &&
        prevProps.surfaceVariant === nextProps.surfaceVariant
    );
});
