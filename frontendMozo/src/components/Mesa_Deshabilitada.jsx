import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBurger } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal } from 'react-bootstrap';
import { useState } from 'react';
import Lista_Items from './Listas/Lista_Items';
import Alert from '@mui/material/Alert';

export default function Mesa_Deshabilitada(props) {

    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
    }

    const handleShow = () => {
        // No permitir abrir modal si no hay caja activa
        if (props.deshabilitadaPorCaja) {
            return;
        }
        setShow(true);
    };

    function formatearFecha(fecha) {
        const date = new Date(fecha);
        const horas = date.getHours().toString().padStart(2, '0'); // Asegura dos dígitos
        const minutos = date.getMinutes().toString().padStart(2, '0');

        return `${horas}:${minutos}`;
    }

    const fechaFormateada = formatearFecha(props.visitaMesa ? props.visitaMesa.fechaHora : null);
    const totalPrecio = props.productos ? props.productos.reduce((acumulador, producto) => acumulador + parseFloat(producto.precio || producto.precioDelMomento || 0), 0) : 0;
    const datosMozo = props.datos_mesa.visita?.mozo;
    console.log("DATOS_MESA: ", props.datos_mesa);

    const modal = (
        <>
            <Button 
                className="boton-mesa mx-2" 
                style={props.estilo} 
                onClick={handleShow} 
                variant={props.variant}
                disabled={props.deshabilitadaPorCaja}
            >
                <FontAwesomeIcon icon={faBurger} />
                <p>Mesa {props.datos_mesa.nombre}</p>
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className="me-3">Pedidos de la Mesa</Modal.Title>
                    <Alert icon={false} severity="warning" sx={{ fontSize: '1.2rem' }}>{props.datos_mesa.codigoParaPedir}</Alert>
                </Modal.Header>
                <Modal.Body>
                    <Alert severity="info">Atendida por {datosMozo ? datosMozo.nombres + ' ' + datosMozo.apellido : 'No asignado'} - {fechaFormateada} - ${totalPrecio}</Alert>
                    <hr></hr>
                    <Lista_Items visitasMesa={[props.visitaMesa]} titulo="Pedido total" subtitulo="Total" estado={false}></Lista_Items>
                    <hr></hr>
                    <div style={{ maxHeight: '28vh', overflowY: 'auto', marginBottom: '2em' }} >
                        <Lista_Items visitasMesa={[props.visitaMesa]} titulo="Ticket" subtitulo="Subtotal" estado={1} facturar={false}></Lista_Items>
                    </div>
                        <hr></hr>
                    <Lista_Items visitasMesa={[props.visitaMesa]} titulo="Pagado" subtitulo="Subtotal" estado={2}></Lista_Items>
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
