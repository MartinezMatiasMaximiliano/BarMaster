import { React, useState } from "react"
import { Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import Multiple_Select from "../components/Select_Multiple";
import Input_Imagen from "../components/Input_Imagen";
import Select from "../components/Select";
import { validarCampos } from "../Helpers/HelperFunctions";

function Modal_Agregar(props) {
    const [show, setShow] = useState(false);
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});

    const handleClose = () => {
        setErrors({});
        setShow(false);
    };
    const handleShow = () => setShow(true);

    const handleChange = (event, key) => {
        let valor;
        if (key === "rol") {
            valor = { id: event.target.value, nombre: '' };
        } else if (key === "imagen") {
            valor = event.target.files[0];
        } else {
            valor = event.target.value;
        }

        setValues((prev) => ({ ...prev, [key]: valor }));
        validarCampos(key, valor, setErrors);
    };

    const handleSave = async () => {
        if (Object.keys(errors).length === 0) {
            await props.agregar(values);
            handleClose();
            await props.recargarComponentes();
        }
    };

    // Diccionario para definir el tipo de componente por campo
    const fieldRenderers = {
        Imagen: (col, index) => (
            <Input_Imagen key={index} handleChange={handleChange} />
        ),
        Categorias: (col, index) => (
            <Multiple_Select
                key={index}
                itemsTotales={props.categoriasTotales}
                titulo="Categorias"
                itemsActivos={[]}
                handleChange={handleChange}
            />
        ),
        Rol: (col, index) => (
            <Select
                key={index}
                datos_select={props.configSelect.datos}
                datoActual=""
                titulo={props.configSelect.titulo}
                name={props.configSelect.name}
                handleChange={handleChange}
            />
        ),
    };

    const ignoredFields = ["Código", "Mozo"];

    // Render genérico para campos que no están en el diccionario
    const defaultRenderer = (col, index) => (
        <Form.Group className="mb-3" key={index} controlId={`campo-${index}`}>
            <Form.Label>{col}</Form.Label>
            <Form.Control
                type="text"
                placeholder={`Ingrese valor para ${col}`}
                onChange={(e) => handleChange(e, col)}
            />
        </Form.Group>
    );

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
                    {Object.keys(errors).length > 0 && (
                        <div style={{
                            backgroundColor: '#ffe6e6',
                            padding: '10px',
                            marginBottom: '10px',
                            border: '1px solid red'
                        }}>
                            <p><strong>Errores en el formulario:</strong></p>
                            <ul>
                                {Object.entries(errors).map(([key, value]) => (
                                    <li key={key} style={{ color: 'red' }}>
                                        Campo <b>{key}</b>: {value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Form>
                        {props.columnas.map((col, index) => {
                            if (ignoredFields.includes(col)) return null;
                            const renderer = fieldRenderers[col] || defaultRenderer;
                            return renderer(col, index);
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
