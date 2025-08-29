import { React, useState } from "react"
import { Button, Modal, Form } from 'react-bootstrap';
import { validarCampos } from "../../Helpers/HelperFunctions";
import { ModificarCodigoMozo } from "../../API/APIPersonas";

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

    const handleSave = () => {

        if (Object.keys(errors).length === 0) {

            // Modifica el registro en la DB
            ModificarCodigoMozo({id: datos.id, nuevoCodigo: value})

            // Cerrar el modal después de guardar
            handleClose();
        }
    };

    const handleChange = (e, key) => {
        const valor = e.target.value;
        setValue(valor);
        validarCampos(key, valor, setErrors);
        console.log("ERRORES: ", errors);
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
                    <div>
                        {Object.keys(errors).length > 0 && (
                            <div style={{ backgroundColor: '#ffe6e6', padding: '10px', marginBottom: '10px', border: '1px solid red' }}>
                                <p><strong>Errores en el formulario:</strong></p>
                                <ul>
                                    {Object.keys(errors).map(key => (
                                        <li key={key} style={{ color: 'red' }}>Campo <b>{key}</b>: {errors[key]}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Codigo</Form.Label>
                            <Form.Control
                                value={value}
                                onChange={(e) => handleChange(e, "codigoDeServicio")}
                            />
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
