import { React, useState } from "react"
import { Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import Errores from "./Errores"
import Handlers from "./Handlers";
import { Renderizados } from "./Renderizados";

function Modal_Agregar(props) {
    const [show, setShow] = useState(false);
    const [values, setValues] = useState({});

    const handleClose = () => {
        setErrors({});
        setShow(false);
    };
    const handleShow = () => setShow(true);

    const { errors, setErrors, handleChange, handleSave } = Handlers({
        agregar: props.agregar,
        recargarComponentes: props.recargarComponentes,
        handleClose,
    });

    const renderizados = Renderizados(props, handleChange);

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                <FontAwesomeIcon icon={faSquarePlus} />
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar {props.nombre}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Errores errors={errors}></Errores>
                    <Form>
                        {props.campos.map((campo, index) => {   
                            const renderer = renderizados[campo.type] || renderizados.default;
                            return renderer(campo, index);
                        })}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Agregar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modal_Agregar;
