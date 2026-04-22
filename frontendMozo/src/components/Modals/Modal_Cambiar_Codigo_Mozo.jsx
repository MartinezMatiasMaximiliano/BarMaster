import { React, useState } from "react"
import { Button, Modal, Form } from 'react-bootstrap';
import { obtenerErrorCampo, validarCampos } from "../../Helpers/HelperFunctions";
import { ModificarCodigoMozo } from "../../API/APIPersonas";

const codigoMozoField = {
    name: "codigoDeServicio",
    label: "Codigo",
    required: true,
    validation: {
        rule: "code4",
    },
};

function Modal_Cambiar_Codigo_Mozo(props) {

    const datos = props.datos;

    const [errors, setErrors] = useState({});   

    const [value, setValue] = useState(datos.codigoDeServicio);

    const [show, setShow] = useState(false);

    const handleClose = () => {
        setErrors({});
        setShow(false);
    }

    const handleShow = () => setShow(true);

    const handleSave = async () => {
        const errorCodigo = obtenerErrorCampo("codigoDeServicio", value, codigoMozoField);
        if (errorCodigo) {
            setErrors({ codigoDeServicio: errorCodigo });
            return;
        }

        if (Object.keys(errors).length === 0) {

            // Modifica el registro en la DB
            await ModificarCodigoMozo({...datos, nuevoCodigo: value});

            // Cerrar el modal después de guardar
            handleClose();
            await props.recargarComponentes();
        }
    };

    const handleChange = (e, key) => {
        const valor = e.target.value;
        setValue(valor);
        validarCampos(key, valor, setErrors, codigoMozoField);
    }

    return (
        <>
            <Button variant="primary" onClick={handleShow} className="ms-2">
                Cambiar Código
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar {props.mensaje}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Codigo</Form.Label>
                            <Form.Control
                                value={value}
                                isInvalid={Boolean(errors.codigoDeServicio)}
                                onChange={(e) => handleChange(e, "codigoDeServicio")}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.codigoDeServicio}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Modificar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modal_Cambiar_Codigo_Mozo;
