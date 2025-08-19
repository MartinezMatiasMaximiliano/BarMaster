import React, { useState, useEffect, useContext } from "react"
import { Stack, Card, CardContent, Typography, Divider, Box, ButtonGroup, SvgIcon } from "@mui/material";
import { useNavigate } from "react-router-dom"
import connection from '../connections/HubConnCliente';
import Card_Carrito from "../components/Card_Carrito"
import Modal_EnviarPedido from "../components/Modal_EnviarPedido";
import { calcularTotal } from '../Helpers/HelperFunctions'
import RoomServiceIcon from '@mui/icons-material/RoomService';
import { PedidoContext, LoginContext, NumeroMesaContext } from '../App.jsx'

function Pedido() {
    const { pedido, setPedido } = useContext(PedidoContext)
    const loginProvider = useContext(LoginContext);
    const numeroMesaProvider = useContext(NumeroMesaContext);
    const navigate = useNavigate(); //Para redireccionar

    useEffect(() => {
        if (loginProvider.logeado == false || numeroMesaProvider.numeroMesa == -1) {
            navigate('/')
        }
    }, [])

    console.log("PEDIDO: ", pedido);

    const pedidoAgrupado = pedido.reduce((acc, item) => {
        const key = `${item.nombre}-${item.indicaciones || ""}`;
        if (!acc[key]) {
            acc[key] = { ...item, cantidad: 1 };
        } else {
            acc[key].cantidad += 1;
        }

        return acc;
    }, {});

    const ListaCards = Object.values(pedidoAgrupado).map((pedido, i) => (
        <Card_Carrito
            key={i}
            numeroPedido={pedido.id}
            pedido={pedido}
        />
    ));

    const totalPrecio = calcularTotal(pedido);

    return (

        <Card sx={{ mx: "auto", overflow: "hidden", boxShadow: 10, mt: "30px", mb: "60px", height:'100%'}}>
            <Box sx={{ bgcolor: "#FF7043", color: "white", textAlign: "center", py: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Pedido
                </Typography>
            </Box>
            <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                    Productos para pedir
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box>

                    {pedido.length === 0 ?
                        <Stack sx={{display:"flex",justifyContent:"center"} }>
                            <RoomServiceIcon sx={{display:"block"} }></RoomServiceIcon>
                        <Typography justifyContent="center">No se agregaron items aun, visite nuestro menu para ver los productos disponibles y realizar su pedido!</Typography>
                        </Stack>
                        :
                        ListaCards
                    }

                </Box>

                {pedido.length !== 0 && (
                    <>
                        <Divider sx={{ my: 1 }} >Resumen</Divider>
                        <Box display="flex" justifyContent="space-between" fontWeight="bold" sx={{ mt: 2, fontSize: "1.2rem" }}>
                            <Typography fontWeight="bold">Total:</Typography>
                            <Typography fontWeight="bold">${totalPrecio}</Typography>
                        </Box>
                    </>
                )
                }

            </CardContent>

            {pedido.length !== 0 && (
                <CardContent align="center" sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <ButtonGroup sx={{ width:"100%",padding: 0, margin: 0, paddingBottom: 0, borderRadius: 2 }}>
                        <Modal_EnviarPedido></Modal_EnviarPedido>
                    </ButtonGroup>
                </CardContent>)
            }

        </Card>
    );
}

export default Pedido;
