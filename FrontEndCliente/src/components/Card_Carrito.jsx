import React, { useContext } from "react"
import { Box, Card, CardContent, CardMedia, Typography, IconButton, ButtonGroup, Button, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { PedidoContext } from '../App'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';


function Card_Carrito(props) {
    const { pedido, setPedido } = useContext(PedidoContext)

    console.log("PEDIDO EN CARD CARRITO", pedido);


    function eliminarProductoDePedido(e) {
        const [idPedidoString, indicaciones] = e.currentTarget.value.split("-");
        const idPedido = Number(idPedidoString);
        setPedido((pedido) => {
            const nuevoPedido = [...pedido];
            const index = nuevoPedido.findIndex((p) => p.id === idPedido && p.indicaciones === indicaciones);
            if (index !== -1) {
                nuevoPedido.splice(index, 1);
            }
            return nuevoPedido;
        });
    }

    function agregarProductoDePedido(e) {
        const [idPedidoString, indicaciones] = e.currentTarget.value.split("-");
        const idPedido = Number(idPedidoString);
        setPedido((pedido) => {
            const nuevoPedido = [...pedido];
            const pedidoACopiar = nuevoPedido.find((p) => p.id === idPedido && p.indicaciones === indicaciones);
            nuevoPedido.splice(nuevoPedido.length, 0, pedidoACopiar);
            return nuevoPedido;
        });
    }



    const imagenFondo = `${import.meta.env.VITE_BASE_URL}${props.pedido.imagenUrl}`;

    return (
        <Card
            variant="outlined"
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
                backgroundImage: `url(${imagenFondo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: '20vh',
                position: 'relative', 
                color: 'white',
                overflow: 'hidden',
                px: 2, 
                borderRadius: 4,
                mb: ".5em"
            }}
        >
            {/* Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.45)', // opacidad del fondo
                    zIndex: 1,
                }}
            />

            {/* Contenido principal */}
            <Box sx={{ zIndex: 2 }}>
                <CardContent sx={{ padding: 0 }}>
                    <Typography variant="h6" fontWeight="bold" className="mt-4">
                        {props.pedido.nombre}
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ width: "180px" }} noWrap>
                        {props.pedido.descripcion}
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ width: "180px" }} noWrap>
                        {props.pedido.indicaciones}
                    </Typography>
                    <Typography variant="body2" color="white">
                        ${props.pedido.precio}
                    </Typography>
                </CardContent>
            </Box>

            {/* Contenido derecho */}
            <Box sx={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} className="mt-4">
                <Typography variant="body1" fontWeight="bold">
                    $ {props.pedido.precio * props.pedido.cantidad}
                </Typography>
                <ButtonGroup
                    variant="outlined"
                    color="inherit"
                    sx={{
                        '& .MuiButton-root': {
                            minWidth: '24px',      // achica el ancho mínimo
                            padding: '2px 6px',    // achica el padding interno
                            fontSize: '0.7rem',    // achica el texto
                            lineHeight: 1,
                        }
                    }}
                >
                    <Button color="error" onClick={eliminarProductoDePedido} value={props.numeroPedido + "-" + props.pedido.indicaciones}>
                        <DeleteIcon fontSize="small" />
                    </Button>
                    <Button>{props.pedido.cantidad}</Button>
                    <Button onClick={agregarProductoDePedido} value={props.numeroPedido + "-" + props.pedido.indicaciones}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </ButtonGroup>
            </Box>
        </Card>
    );

}

export default Card_Carrito;

