import { React, useState, useContext } from "react"
import { Typography, Modal, Container, Button, ButtonGroup, Box, TextField } from "@mui/material";
import { PedidoContext } from '../App.jsx'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestaurantIcon from '@mui/icons-material/Restaurant';


function Modal_AgregarAPedido({ producto }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [quantity, setQuantity] = useState(1); // Nueva variable para la cantidad
    const { pedido, setPedido } = useContext(PedidoContext)

    function agregarProductoAlPedido(textoIndicaciones) {
        const nuevoProducto = { ...producto, indicaciones: textoIndicaciones };
        setPedido(prevPedido => [...prevPedido, nuevoProducto]);
    }

    const handleShow = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setQuantity(1);
    };

    const handleTextChange = (e) => { // Sirve para capturar lo que se escribe en el textarea del modal
        setText(e.target.value);
    }

    const handlePedido = () => {
        for (let i = 0; i < quantity; i++) {
            agregarProductoAlPedido(text);
        }
        setText(''); // Se limpia el contenido del textarea
        handleClose(); // Se cierra el modal
    }

    const increaseQuantity = () => setQuantity(quantity + 1);
    const decreaseQuantity = () => { quantity > 1 ? setQuantity(quantity - 1) : null }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95%',
        Height: '70%',
        bgcolor: 'background.paper',
        border: '1px solid #000',
        borderRadius: 2,
        boxShadow: 24,
        overflowY: 'auto'
    };


    return (


        <>
            <Button onClick={handleShow} variant="contained" startIcon={<RestaurantIcon />} sx={{ opacity: "0.9", color: "white", fontWeight: "bold" }}>
                <Typography ><b>Pedir</b></Typography>
            </Button>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Container>
                    <Box sx={style}>
                        <Box
                            component="img"
                            src={import.meta.env.VITE_BASE_URL + producto.imagenUrl}
                            alt={producto.nombre}
                            sx={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: 2,
                                boxShadow: 3,
                            }}
                        />

                        <Box sx={{ p: 2 }}>
                            <Typography id="modal-modal-title" variant="h6">
                                {producto.nombre}
                            </Typography>

                            <Typography id="modal-modal-description" sx={{ mt: 1, maxHeight: '150px', overflow: 'auto' }}>
                                {producto.descripcion}
                            </Typography>

                            <Typography id="modal-modal-title" variant="h6">
                                ${producto.precio}
                            </Typography>

                            <Typography sx={{ mt: 2, mb: 2 }}>
                                Personalizar su pedido
                            </Typography>
                            <TextField
                                fullWidth
                                label="Detalles"
                                variant="outlined"
                                onChange={handleTextChange}
                                multiline
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                <Button variant="outlined" color="warning" onClick={decreaseQuantity}>
                                    <RemoveIcon></RemoveIcon>
                                </Button>
                                <Box sx={{ mx: 2 }}>{quantity}</Box>
                                <Button variant="outlined" color="warning" onClick={increaseQuantity}>
                                    <AddIcon></AddIcon>
                                </Button>
                            </Box>

                            <ButtonGroup
                                fullWidth
                                size="large"
                                sx={{
                                    mt: 3,
                                    borderRadius: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Button onClick={handleClose} variant="contained" sx={{ color: 'white' }}>
                                    Cancelar
                                </Button>
                                <Button onClick={handlePedido} variant="contained" sx={{ color: 'white' }}>
                                    Agregar {quantity > 1 ? `(${quantity})` : ""}
                                </Button>
                            </ButtonGroup>
                        </Box>
                    </Box>
                </Container>
            </Modal>
        </>



    );
}

export default Modal_AgregarAPedido;

