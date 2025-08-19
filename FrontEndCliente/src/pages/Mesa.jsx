import { useState, useEffect, useContext } from 'react'
import { useNavigate } from "react-router-dom"
import { Card, CardContent, Typography, Divider, Box, Grid, ButtonGroup } from "@mui/material";
import Modal_PagoSeparado from "../components/Modal_PagoSeparado";
import Modal_PagarMesa from "../components/Modal_PagarMesa";
import { crearTicket, calcularTotal, formatearFecha } from '../Helpers/HelperFunctions';
import { GetTicketMesa } from '../API/APITicket'
import { LoginContext, NumeroMesaContext } from '../App'

function Mesa(props) {
    const [fecha, setFecha] = useState('')
    const [IdPedido, setIdPedido] = useState(0)
    const [ticket, setTicket] = useState(null);
    const [itemsMesa, setItemsMesa] = useState([]);
    const [error, setError] = useState(null);

    const navigate = useNavigate(); //Para redireccionar
    const loginProvider = useContext(LoginContext);
    const numeroMesaProvider = useContext(NumeroMesaContext);

    useEffect(() => {
        if (loginProvider.logeado == false || numeroMesaProvider.numeroMesa == -1) {
            navigate('/')
        } else {
            GetTicketMesa(numeroMesaProvider.numeroMesa).then(data => { setItemsMesa(data.items); setFecha(data.fechaInicio); setIdPedido(data.idPedido);console.log(data.items)  })
        }
    }, [])

    useEffect(() => {
        if (loginProvider.logeado == false || numeroMesaProvider.numeroMesa == -1) {
            navigate('/')
        } else {
            setTicket(crearTicket(itemsMesa, numeroMesaProvider.numeroMesa));
            setError(null);
        }
    }, [itemsMesa]);

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!ticket) {
        return <p>No tiene ningun pedido realizado.</p>;
    }

    function actualizarEstadoPorIds(idsActualizar) {
        setItemsMesa(prevItems =>
            prevItems.map(item => {
                if (idsActualizar.includes(item.id)) {
                    return { ...item, estado: 1 };
                }
                return item;
            })
        );
    }


    function crearListadoElementos(items) {
        // Reordenamos: primero los que NO son estado 2
        const itemsOrdenados = [
            ...items.filter(item => item.estado !== 2),
            ...items.filter(item => item.estado === 2),
        ];

        const ListaElementos = itemsOrdenados.map((item, index) => (
            <Grid container key={index} sx={{ borderBottom: 2, borderStyle: 'dotted' }}>
                <Grid size={10}>
                    <Box display="flex" justifyContent="space-between">
                        <Typography>{item.nombreProducto}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography sx={{ fontSize: 11, fontWeight: 'light' }}>
                            {item.indicaciones}
                        </Typography>
                    </Box>
                </Grid>
                <Grid size={2} justifyContent="space-between">
                    <Typography>
                        {item.estado === 2 ? <s>${item.precio}</s> : `$${item.precio}`}
                    </Typography>
                </Grid>
            </Grid>
        ));

        return ListaElementos;
    }

    const itemsPendientesPago = itemsMesa.filter(item => item.estado === 0 )
    const itemsEnProceso = itemsMesa.filter(item => item.estado === 1)
    const itemsPagados = itemsMesa.filter(item => item.estado === 2)
    const totalMesa = calcularTotal(itemsPendientesPago) + calcularTotal(itemsEnProceso);

    const listaElementos = crearListadoElementos(itemsMesa);
    const fechaFormateada = formatearFecha(fecha);


    return (
        <Card sx={{ maxWidth: 400, height: "100%", mx: "auto", mt: "30px", mb: "60px", overflow: "hidden", boxShadow: 10 }}>
            <Box sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", py: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Mi mesa
                </Typography>
            </Box>
            <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                    Ticket
                </Typography>
                <Typography variant="body2" align="center" color="textSecondary">
                    {fechaFormateada.includes("NaN") ? '' : fechaFormateada }
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box>
                    {listaElementos}
                    <Divider sx={{ my: 1 }} >Resumen</Divider>
                    <Typography display="flex" justifyContent="space-between" fontWeight="bold" sx={{ mt: 2, fontSize: "1.2rem" }}>
                        <Typography>Total:</Typography> <Typography>${totalMesa}</Typography>
                    </Typography>
                </Box>
            </CardContent>
            <CardContent align="center" sx={{ p: 0, '&:last-child': { pb: 0 }, width: "100%" }}>
                <ButtonGroup
                    sx={{
                        width: "100%", 
                        padding: 0,
                        margin: 0,
                        paddingBottom: 0,
                        borderRadius: 2
                    }}
                    fullWidth 
                >
                    <Modal_PagarMesa IdPedido={IdPedido} CountPendientes={itemsPendientesPago.length} actualizarEstadoPorIds={actualizarEstadoPorIds}></Modal_PagarMesa>

                    <Modal_PagoSeparado
                        fullWidth 
                        itemsMesa={itemsPendientesPago}
                        itemsEnProceso={itemsEnProceso}
                        itemsPagados={itemsPagados}
                    />
                </ButtonGroup>
            </CardContent>
        </Card>
    );
}

export default Mesa;
