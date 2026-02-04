import { useMemo, memo } from 'react';
import Alert from '@mui/material/Alert';
import { Typography, Box } from "@mui/material";
import { useSelector } from 'react-redux';
import Modal_Generico from '../Modals/Modal_Generico';

function Lista_Items(props) {
    const ticket = useSelector((state) => state.ticket.value);

    const mensajeListaVacia = useMemo(() => (
        <div className="mb-0">
            <h4>{props.titulo}</h4>
            <p>No hay items para mostrar</p>
        </div>
    ), [props.titulo]);

    const res = useMemo(() => {
        if (props.estado === 1) {
            // Generar resumen por ticket
            if (!props.visitasMesa || !props.visitasMesa[0] || !props.visitasMesa[0].productos || !ticket || ticket.length === 0) {
                return mensajeListaVacia;
            }

            const todosLosProductos = props.visitasMesa.productosConsumidos;
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
                    
                    if (resumen[nombre]) {
                        resumen[nombre].cantidad++;
                        resumen[nombre].total += precio;
                    } else {
                        resumen[nombre] = {
                            precioUnitario: precio,
                            cantidad: 1,
                            total: precio
                        };
                    }
                    total += precio;
                });

                return (
                    <div key={indexTicket}>
                        <Box key={indexTicket} sx={{ mb: 2 }}>
                            <h4>Ticket #{indexTicket + 1}</h4>
                            {Object.entries(resumen).map(([nombre, data], index) => (
                                <Box
                                    key={index}
                                    sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
                                >
                                    <Typography variant="body2">
                                        {`${data.cantidad}x ${nombre} ($${data.precioUnitario} x1)`} ...
                                    </Typography>
                                    <Typography variant="body2">
                                        ${data.total}
                                    </Typography>
                                </Box>
                            ))}
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
            if (!props.visitasMesa || !props.visitasMesa[0] || !props.visitasMesa[0].productos) {
                return mensajeListaVacia;
            }

            const estado = props.estado;
            const resumen = {};
            let total = 0;
            const productosCorrespondientes = estado 
                ? props.visitasMesa[0].productos.filter(producto => producto.estadoPreparacion === estado) 
                : props.visitasMesa[0].productos;

            productosCorrespondientes.forEach(producto => {
                const nombre = producto.nombre || producto.nombreProducto;
                const precio = producto.precio || producto.precioDelMomento;
                
                if (resumen[nombre]) {
                    resumen[nombre].cantidad++;
                    resumen[nombre].total += precio;
                } else {
                    resumen[nombre] = {
                        precioUnitario: precio,
                        cantidad: 1,
                        total: precio
                    };
                }
                total += precio;
            });

            let texto = Object.entries(resumen).map(([nombre, data], index) => (
                <Box
                    key={index}
                    sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
                >
                    <Typography variant="body2">
                        {`${data.cantidad}x ${nombre} ($${data.precioUnitario} x1)`} ...
                    </Typography>
                    <Typography variant="body2">
                        ${data.total}
                    </Typography>
                </Box>
            ));

            const resultado = <>
                <h4>{props.titulo}</h4>
                <pre>{texto}</pre>
                <Alert severity="success"><b>{props.subtitulo}</b>: ${total}</Alert>
            </>;

            return (total != 0 ? resultado : mensajeListaVacia);
        }
    }, [props.visitasMesa, props.estado, props.titulo, props.subtitulo, props.facturar, props.PagarMesa, ticket, mensajeListaVacia]);

    return res;
}

// Memoizar con comparador optimizado para Firefox
export default memo(Lista_Items, (prevProps, nextProps) => {
    if (prevProps.visitasMesa === nextProps.visitasMesa &&
        prevProps.estado === nextProps.estado &&
        prevProps.titulo === nextProps.titulo &&
        prevProps.subtitulo === nextProps.subtitulo &&
        prevProps.facturar === nextProps.facturar &&
        prevProps.PagarMesa === nextProps.PagarMesa) {
        return true;
    }
    return false;
});
