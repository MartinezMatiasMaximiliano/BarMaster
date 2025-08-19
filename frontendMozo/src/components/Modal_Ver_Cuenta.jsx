import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import connection from '../connections/HubConnMozo'
import Lista_Items from './Lista_Items';
import Modal_Generico from './Modal_Generico';
import { useSelector, useDispatch } from "react-redux";
import { CambiarEstadoItems } from '../API/APIItems';
import { GenerarTicketPDF } from '../API/APIPedidos';
import { cambiarEstadoItems as CambiarEstadoItemsState } from '../redux/slices/pedidosActivosSlice';
import { eliminar as eliminarTicket} from '../redux/slices/ticketSlice';


function Modal_Ver_cuenta(props) {

    const dispatch = useDispatch()

    const pedidosActivos = useSelector((state) => state.pedidosActivos.value);

    const [pedidosMesa, setPedidosMesa] = useState(pedidosActivos.filter(pedido => pedido.numeroMesa === props.datos_mesa.numeroMesa));

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    console.log("PEDIDOSMESA: ", pedidosMesa);

    useEffect(() => {
        setPedidosMesa(pedidosActivos.filter(pedido => pedido.numeroMesa === props.datos_mesa.numeroMesa));
    }, [pedidosActivos, props.datos_mesa.numeroMesa])

    function PagarMesa(arregloIds) {

        // Actualizo la DB
        CambiarEstadoItems(arregloIds, "Pagar");

        // Genero la factura
        GenerarTicketPDF(props.datos_mesa.numeroMesa, arregloIds)

        // Se envia mensaje al cliente para actualizar su cuenta
        connection.send("RecargarTicket", props.datos_mesa.numeroMesa);

        // Actualizo el state pedidosActivos
        dispatch(CambiarEstadoItemsState({ idsItems: arregloIds, estadoNuevo: 2 }));

        // Actualizo el state ticket
        dispatch(eliminarTicket(arregloIds));

        // Cierro el modal

        alert("Pedidos facturados");

        handleClose();
        props.cerrar_modal_mesa();
    };

    const itemsAPagar = pedidosMesa[0].items.filter(item => item.estado !== 2).map(item => item.id);

    return (
        <>
            <Button variant="primary" className="me-2" onClick={handleShow}>
                {props.textoBoton}
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{props.titulo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        <Lista_Items pedidosMesa={pedidosMesa} titulo="Pedido total" subtitulo="Total" estado={false}></Lista_Items>
                    <hr></hr>
                    <div style={{ maxHeight: '28vh',overflowY: 'auto', marginBottom: '2em'}} >
                        <Lista_Items pedidosMesa={pedidosMesa} titulo="Ticket" PagarMesa={PagarMesa} estado={1} facturar={true}></Lista_Items>
                    </div>
                        <hr></hr>
                            <Lista_Items pedidosMesa={pedidosMesa} titulo="Pagado" subtitulo="Subtotal" estado={2}></Lista_Items>
                </Modal.Body>
                <Modal.Footer>
                    <Modal_Generico textoBoton="Facturar todo" titulo="Facturar todo" cuerpo="¿Confirmar la accion?" confirmar={true} func={PagarMesa} param={itemsAPagar} disabled={!itemsAPagar.length > 0}></Modal_Generico>
                    <Button variant="secondary" onClick={handleClose}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modal_Ver_cuenta;
