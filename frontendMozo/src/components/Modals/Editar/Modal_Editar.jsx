import { React, useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { validarCampos } from "../../../Helpers/HelperFunctions";
import { Renderizados } from "./Renderizados";
import Errores from "./Errores"
import Handlers from "./Handlers";

function Modal_Editar(props) {
    const [show, setShow] = useState(false);

    const { id, activo, ...filaFiltrada } = props.fila;

    const [editValues, setEditValues] = useState({ ...filaFiltrada });

    const handleClose = () => {
        setErrors({});
        setShow(false);
    };

    const handleShow = () => setShow(true);

    useEffect(() => {
        if (show) setEditValues({ ...filaFiltrada });
    }, [show]);

    const { errors, setErrors, handleChange, handleSave } = Handlers({
            id,
            editValues,
            setEditValues,
            modificar: props.modificar,
            recargarComponentes: props.recargarComponentes,
            handleClose,
        });

    const renderizados = Renderizados(props, handleChange);

    return (
        <>
            <Button variant="primary" onClick={handleShow} disabled={!props.disabled}>
                <FontAwesomeIcon icon={faPencil} />
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Editar
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Errores errors={errors}></Errores>
                     <Form>
                        {props.campos.map((campo, index) => {
                            const value = editValues[campo.name];
                            const renderer = renderizados[campo.type] || renderizados.text;
                            return renderer(campo, value, index);
                        })}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Editar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modal_Editar;