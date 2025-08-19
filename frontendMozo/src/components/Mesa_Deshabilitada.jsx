import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBurger } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { Button, Modal } from 'react-bootstrap';
import { useState } from 'react';
import Lista_Items from './Lista_Items';
import Alert from '@mui/material/Alert';

export default function Mesa_Deshabilitada(props) {

    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
    }

    const handleShow = () => setShow(true);

    function formatearFecha(fecha) {
        const date = new Date(fecha);
        const horas = date.getHours().toString().padStart(2, '0'); // Asegura dos dígitos
        const minutos = date.getMinutes().toString().padStart(2, '0');

        return `${horas}:${minutos}`;
    }

    const fechaFormateada = formatearFecha(props.pedidoMesa ? props.pedidoMesa.fechaRealizado : null);
    const totalPrecio = props.pedidoMesa ? (props.pedidoMesa.items).reduce((acumulador, item) => acumulador + parseFloat(item.precio), 0) : 0;
    const datosMozo = props.datos_mesa.persona;

    const modal = (
        <>
            <Button className="boton-mesa mx-2" style={props.estilo} onClick={handleShow} variant={props.variant}>
                <FontAwesomeIcon icon={faBurger} />
                <p>Mesa {props.datos_mesa.numeroMesa}</p>
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className="me-3">Pedidos de la Mesa</Modal.Title>
                    <Alert icon={false} severity="warning" sx={{ fontSize: '1.2rem' }}>{props.datos_mesa.codigoParaPedir}</Alert>
                </Modal.Header>
                <Modal.Body>
                    <Alert severity="info">Atendida por {datosMozo ? datosMozo.nombres + ' ' + datosMozo.apellido : 'No asignado'} - {fechaFormateada} - ${totalPrecio}</Alert>
                    <hr></hr>
                    <Lista_Items pedidosMesa={[props.pedidoMesa]} titulo="Pedido total" subtitulo="Total" estado={false}></Lista_Items>
                    <hr></hr>
                    <div style={{ maxHeight: '28vh', overflowY: 'auto', marginBottom: '2em' }} >
                        <Lista_Items pedidosMesa={[props.pedidoMesa]} titulo="Ticket" subtitulo="Subtotal" estado={1} facturar={false}></Lista_Items>
                    </div>
                        <hr></hr>
                    <Lista_Items pedidosMesa={[props.pedidoMesa]} titulo="Pagado" subtitulo="Subtotal" estado={2}></Lista_Items>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );

    return <>{modal}</>;
}
