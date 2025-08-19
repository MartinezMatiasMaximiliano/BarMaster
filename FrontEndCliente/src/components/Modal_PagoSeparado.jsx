import { useState,useContext } from 'react';
import { Modal, Form } from "react-bootstrap";
import { Button } from "@mui/material";
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { CrearNotificacion } from '../Helpers/HelperFunctions';
import { ProcesarPedidos } from '../API/APIPedidos'
import connection from '../connections/HubConnCliente';
import { LoginContext, NumeroMesaContext } from '../App'

function Modal_PagoSeparado(props) {
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [productosEnProceso, setProductosEnProceso] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [show, setShow] = useState(false);
    const loginProvider = useContext(LoginContext);
    const numeroMesaProvider = useContext(NumeroMesaContext);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleCheckboxChange = (producto) => {
        setProductosSeleccionados((prev) =>
            prev.includes(producto)
                ? prev.filter((p) => p !== producto)
                : [...prev, producto]
        );
    };

    const handleConfirmarPago = async () => {
        setEnviando(true);
        try {
            await PedirCuentaSeparada(productosSeleccionados);
            setProductosEnProceso((prev) => [...prev, ...productosSeleccionados]);
            setProductosSeleccionados([]);
            connection.send("RecargarTicket", numeroMesaProvider.numeroMesa);
            handleClose();
        } catch (error) {
            console.error("Error al pagar:", error);
        } finally {
            setEnviando(false);
        }
    };


    function PedirCuentaSeparada(productosSeleccionados) {
        var ArregloIdsItems = productosSeleccionados.map((item) => item.id)
        ProcesarPedidos(ArregloIdsItems);
        connection.send("EnviarNotificacionAMozos", CrearNotificacion(numeroMesaProvider.numeroMesa, 'SepararCuenta'))
        connection.send("PagarMesaSeparado", ArregloIdsItems)
        alert("Se ha solicitado la cuenta de los items seleccionados correctamente.");
    }
    console.log(typeof (props.itemsMesa))

    return (
        <>
            <Button onClick={handleShow} variant="contained" sx={{ marginLeft: ".8em", color: "white" }}>
                <b>Separar Cuenta</b>
                <RequestQuoteIcon></RequestQuoteIcon>
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Seleccionar Productos</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Productos disponibles:</h5>
                    {props.itemsMesa.filter(item => !productosEnProceso.includes(item)).map((item, index) => (
                        <Form.Check
                            key={index}
                            type="checkbox"
                            label={`${item.nombreProducto} - $${item.precio.toFixed(2)} `}
                            checked={productosSeleccionados.includes(item)}
                            onChange={() => handleCheckboxChange(item)}
                        />
                    ))}
                    {props.itemsEnProceso.length > 0 && (
                        <>
                            <h5 className="mt-3 text-muted">Procesando pago:</h5>
                            {props.itemsEnProceso.map((item, index) => (
                                <div key={index} className="text-muted">
                                    {`${item.nombreProducto} - $${item.precio.toFixed(2)} `}
                                </div>
                            ))}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleClose} disabled={enviando}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmarPago}
                        disabled={enviando || productosSeleccionados.length === 0}
                    >
                        {enviando ? "Procesando..." : "Pagar"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modal_PagoSeparado;
