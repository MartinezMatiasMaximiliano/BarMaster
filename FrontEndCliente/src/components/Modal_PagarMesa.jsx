import { useState, useContext } from 'react'
import { Typography, Modal, Container, Button, ButtonGroup, Box } from "@mui/material";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { CrearNotificacion } from '../Helpers/HelperFunctions';
import connection from '../connections/HubConnCliente';
import { NumeroMesaContext } from '../App.jsx'
import { GetTicketMesa } from '../API/APITicket';
import { ProcesarPedidos } from '../API/APIPedidos'

function Modal_PagarMesa(props) {
    const [open, setOpen] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const numeroMesaProvider = useContext(NumeroMesaContext);
    const handleShow = () => setOpen(true);

    const handleClose = () => { setOpen(false); };

    const handlePagarTotal = () => {
        if (cooldown) {
            alert("Por favor, espere antes de intentar nuevamente.");
            return;
        }
        actualizarEstadoItems(numeroMesaProvider.numeroMesa);
        connection.send("PagarMesa", props.IdPedido);
        connection.send("EnviarNotificacionAMozos", CrearNotificacion(numeroMesaProvider.numeroMesa, 'PedirCuenta'))
        alert("Se ha solicitado la cuenta correctamente.");
        setCooldown(true);
        setTimeout(() => setCooldown(false), 180000); // 3 minutos de cooldown
        handleClose()
    };

    const actualizarEstadoItems = async (numeroMesa) => {
        const ticketMesa = await GetTicketMesa(numeroMesa);
        const idItemsMesa = ticketMesa.items.filter((item) => item.estado == 0).map((item) => item.id);

        // Actualizo la DB
        ProcesarPedidos(idItemsMesa);

        // Actualizo el state
        props.actualizarEstadoPorIds(idItemsMesa);

        console.log("IDSITEMSMESA:", idItemsMesa);
    }


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
          <Button
              fullWidth
              onClick={cooldown || props.CountPendientes == 0 ? null: handleShow}
              style={{
                  cursor: cooldown || props.CountPendientes == 0 ? "not-allowed" : "pointer",
                  opacity: cooldown || props.CountPendientes == 0 ? 0.5 : 1,
                  color: "white"
              }}
              variant="contained"
          >
              <AttachMoneyIcon />
              <b>Pagar Todo</b>
          </Button>


          <Modal
              open={open}
              onClose={handleClose}

          >
              <Container>
                  <Box sx={style}>
                      <Box sx={{ p: 2 }}>
                          <Typography id="modal-modal-title" variant="h6">
                              Solicitar pago total?
                          </Typography>

                          <Typography id="modal-modal-description" sx={{ mt: 1, maxHeight: '150px', overflow: 'auto' }}>
                              Se enviara una notificacion al mozo y se procesara el pago para los productos restantes.
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
                              <Button onClick={handleClose} variant="contained" sx={{ color: 'white', m: 1 }}>
                                  Cancelar
                              </Button>
                              <Button onClick={handlePagarTotal} variant="contained" sx={{ color: 'white', m: 1 }}>
                                  Pagar Total
                              </Button>
                          </ButtonGroup>
                      </Box>
                  </Box>
              </Container>
          </Modal>
      </>
  );
}

export default Modal_PagarMesa;
