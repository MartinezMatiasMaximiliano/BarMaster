import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Modal_Generico(props) {

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const confirmarModal = () => {
        if (props.titulo === "Cerrar mesa") {
            props.cerrar_modal();
        }
        setShow(false);
        props.param !== undefined ? props.func(props.param) : props.func();
    }

    const botonConfirmar = <Button variant="primary" onClick={confirmarModal}>
        Confirmar
    </Button>;

    return (
        <>
            <Button variant={props.variant ? props.variant : "primary"} className="me-2" onClick={handleShow} disabled={props.disabled}>
                {props.textoBoton}
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{props.titulo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{props.cuerpo}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    {props.confirmar && botonConfirmar }
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modal_Generico;
