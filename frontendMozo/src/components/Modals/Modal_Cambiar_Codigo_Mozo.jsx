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
    const [saving, setSaving] = useState(false);

    const handleClose = () => {
        setErrors({});
        setSaving(false);
        setShow(false);
    }

    const handleShow = () => setShow(true);

    const handleSave = async () => {
        const errorCodigo = obtenerErrorCampo("codigoDeServicio", value, codigoMozoField);
        if (errorCodigo) {
            setErrors({ codigoDeServicio: errorCodigo });
            return;
        }

        setSaving(true);
        try {
            await ModificarCodigoMozo({ ...datos, nuevoCodigo: value });
            handleClose();
            await props.recargarComponentes();
        } catch (error) {
            const mensaje = error?.message || 'No se pudo modificar el código del mozo.';
            const esCodigoRepetido = /c[oó]digo/i.test(mensaje) && /(existe|repet|duplic)/i.test(mensaje);

            setErrors({
                codigoDeServicio: esCodigoRepetido
                    ? 'Ya existe un mozo con ese código.'
                    : mensaje,
            });
        } finally {
            setSaving(false);
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
                    <Modal.Title>Cambiar código de mozo</Modal.Title>
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
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Modificando...' : 'Modificar'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modal_Cambiar_Codigo_Mozo;
