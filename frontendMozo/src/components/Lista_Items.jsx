import Alert from '@mui/material/Alert';
import { Typography, Box } from "@mui/material";
import { useSelector } from 'react-redux';
import Modal_Generico from './Modals/Modal_Generico';

function Lista_Items(props) {

    const ticket = useSelector((state) => state.ticket.value);

    const mensajeListaVacia = <div className="mb-0">
        <h4>{props.titulo}</h4>
        <p>No hay items para mostrar</p>
    </div>
    function generarResumenPedidos(pedidosMesa, estado) {
        const resumen = {};
        let total = 0;
        const itemsCorrespondientes = estado ? pedidosMesa[0].items.filter(item => item.estado === estado) : pedidosMesa[0].items;

        itemsCorrespondientes.forEach(item => {
                if (resumen[item.nombre]) {
                    resumen[item.nombre].cantidad++;
                    resumen[item.nombre].total += item.precio;
                } else {
                    resumen[item.nombre] = {
                        precioUnitario: item.precio,
                        cantidad: 1,
                        total: item.precio
                    };
                }
                total += item.precio;
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

        const res = <>
            <h4>{props.titulo}</h4>
            <pre>{texto}</pre>
            <Alert severity="success"><b>{props.subtitulo}</b>: ${total}</Alert>
        </>;

        return (total != 0 ? res : mensajeListaVacia);
    }

    function generarResumenPedidosPorTicket(pedidosMesa, idsTicket) {
        const todosLosItems = pedidosMesa[0].items;

        // Agrupar items por ticket según los IDs en idsTicket
        const itemsPorTicket = idsTicket.map(idsGrupo =>
            todosLosItems.filter(item => idsGrupo.includes(item.id))
        );

        // Filtrar grupos vacíos (sin coincidencias)
        const itemsPorTicketFiltrados = itemsPorTicket.filter(grupo => grupo.length > 0);

        const resumenPorTicket = itemsPorTicketFiltrados.map((grupoItems, indexTicket) => {
            const resumen = {};
            let total = 0;

            grupoItems.forEach(item => {
                if (resumen[item.nombre]) {
                    resumen[item.nombre].cantidad++;
                    resumen[item.nombre].total += item.precio;
                } else {
                    resumen[item.nombre] = {
                        precioUnitario: item.precio,
                        cantidad: 1,
                        total: item.precio
                    };
                }
                total += item.precio;
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
                            {props.facturar && <Modal_Generico variant="outline-primary" textoBoton="Facturar ticket" titulo="Facturar ticket" cuerpo="¿Confirmar la accion?" confirmar={true} func={props.PagarMesa} param={itemsPorTicketFiltrados[indexTicket].map(item => item.id)}></Modal_Generico>}
                        </Box>
                    </Box>
                    {indexTicket !== itemsPorTicketFiltrados.length - 1 && (
                        <hr className="w-50 mx-auto" />
                    )}
                </div>
            );
        });

        return (resumenPorTicket.length > 0 ? resumenPorTicket : mensajeListaVacia);
    }


    const res = props.estado == 1 ? generarResumenPedidosPorTicket(props.pedidosMesa, ticket) : generarResumenPedidos(props.pedidosMesa, props.estado);

    return res;
};

export default Lista_Items;
