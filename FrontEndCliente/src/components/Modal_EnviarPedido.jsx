import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Modal, Typography, Box, Button, ButtonGroup } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { CrearNotificacion } from '../Helpers/HelperFunctions'
import connection from '../connections/HubConnCliente';
import { PedidoContext, NumeroMesaContext } from '../App.jsx'

function Modal_EnviarPedido(props) {
    const [mensajeEnvio, setMensajeEnvio] = useState(""); //De confirmacion o error
    const [enviando, setEnviando] = useState(false); //Deshabilita los botones para evitar varios envios
    const [open, setOpen] = useState(false);
    const { pedido, setPedido } = useContext(PedidoContext)
    const numeroMesaProvider = useContext(NumeroMesaContext);
    const navigate = useNavigate(); //Para redireccionar

    const handleShow = () => setOpen(true);
    const handleClose = () => { setOpen(false); };

    async function enviarPedido() {
        setEnviando(true);
        if (enviando) { // Para evitar envios duplicados
            return;
        }
        try {
            connection.send("GuardarCarrito", pedido, numeroMesaProvider.numeroMesa)
            connection.send("EnviarNotificacionAMozos", CrearNotificacion(numeroMesaProvider.numeroMesa, 'RealizaPedido'))
            setPedido([])
            setMensajeEnvio("Su pedido se ha enviado correctamente!")
            setTimeout(() => {
                setMensajeEnvio("");
                setEnviando(false);
                handleClose();
                navigate(`../mesa`);
            }, 3000);

        } catch (error) {
            console.log(error)
            setMensajeEnvio("Hubo un problema al enviar su pedido.");
            setTimeout(() => {
                setMensajeEnvio("");
                setEnviando(false);
                navigate("/menu"); 
            }, 3000);
        }
    }

    
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
            <Button fullWidth variant="contained" onClick={handleShow} className="mt-3" sx={{ color: "white" }}>
                <Typography ><b>Enviar Pedido</b></Typography>
            </Button>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Container>
                    <Box sx={style}>
                        <Box sx={{ p: 2 }}>
                            <Typography id="modal-modal-title" variant="h6">
                                Enviar pedido a la cocina?
                            </Typography>

                            <Typography id="modal-modal-description" sx={{ mt: 1, maxHeight: '150px', overflow: 'auto' }}>
                                Sus productos agregados seran enviados a la cocina y comenzara a prepararse su comida. <br></br>
                                Por favor revise que todo se encuentre como usted desea.<br></br>
                                Enviar Pedido?
                            </Typography>

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
                                <Button onClick={enviarPedido} disabled={enviando} variant="contained" sx={{ color: 'white' }}>
                                    {enviando ? "Enviando..." : "Enviar"}
                                </Button>
                            </ButtonGroup>
                        </Box>
                    </Box>
                </Container>
            </Modal>
            
        </>

    );
}

export default Modal_EnviarPedido;




