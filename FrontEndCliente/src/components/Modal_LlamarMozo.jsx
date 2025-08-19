import { useState, useContext } from 'react'
import { Typography, Modal, Container, Button, ButtonGroup, Box } from "@mui/material";
import connection from '../connections/HubConnCliente';
import { CrearNotificacion } from '../Helpers/HelperFunctions'
import NotificationsIcon from '@mui/icons-material/Notifications';
import { LoginContext, NumeroMesaContext } from '../App.jsx'

function Modal_LlamarMozo() {
    const [open, setOpen] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const logeadoProvider = useContext(LoginContext)
    const NumeroMesaProvider = useContext(NumeroMesaContext)

    const handleShow = () => setOpen(true);

    const handleClose = () => {setOpen(false);};


    const handleLlamarMozo = () => {
        if (cooldown) {
            alert("Por favor, espere antes de intentar nuevamente.");
            return;
        }
        connection.send("EnviarNotificacionAMozos", CrearNotificacion(NumeroMesaProvider.numeroMesa, 'LlamarMozo'))

        alert("Se ha notificado al mozo correctamente.");
        setCooldown(true);
        setTimeout(() => setCooldown(false), 180000); // 3 minutos de cooldown
        handleClose()
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        bgcolor: 'background.paper',
        border: '1px solid #000',
        borderRadius: 2,
        boxShadow: 24,
        overflowY: 'auto'
    };

    return (
        <>
            <Button onClick={!cooldown ? handleShow : null}
                style={{
                    cursor: cooldown ? "not-allowed" : "pointer",
                    opacity: cooldown ? 0.5 : 1,
                }}>
                <NotificationsIcon></NotificationsIcon>
                Llamar al mozo
            </Button>


            <Modal
                open={open}
                onClose={handleClose}

            >
                <Container>
                    <Box sx={style}>
                        <Box sx={{ p: 2 }}>
                            <Typography id="modal-modal-title" variant="h6">
                                Notificar a su mozo?
                            </Typography>

                            <Typography id="modal-modal-description" sx={{ mt: 1, maxHeight: '150px', overflow: 'auto' }}>
                                Se enviara una notificacion a su mozo de que su mesa solicita de su asistencia.
                                <br></br>
                                Enviar notificacion?
                            </Typography>

                            <ButtonGroup
                                fullWidth
                                size="small"
                                sx={{
                                    mt: 3,
                                    borderRadius: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Button onClick={handleClose} variant="contained" sx={{ color: 'white',m:1 }}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleLlamarMozo} variant="contained" sx={{ color: 'white',m:1 }}>
                                   Llamar Mozo
                                </Button>
                            </ButtonGroup>
                        </Box>
                    </Box>
                </Container>
            </Modal>
        </>
    );
}

export default Modal_LlamarMozo;
