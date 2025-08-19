import { React, useState } from "react"
import { Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function Modal_Eliminar(props) {

    const endpoint = props.endpoint;
    const idFila = props.id;
    const userToken = localStorage.getItem('token');

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSave = async () => {
        await props.eliminar(idFila, userToken);

        // Cerrar el modal después de guardar
        handleClose();
        await props.recargarComponentes();
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow} className="ms-2">
                <FontAwesomeIcon icon={faTrash} />
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar {props.mensaje}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Esta seguro que desea borrar el registro ?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modal_Eliminar;
