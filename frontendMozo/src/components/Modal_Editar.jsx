import { React, useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import Multiple_Select from "../components/Select_Multiple";
import Select from "../components/Select";
import Input_Imagen from "../components/Input_Imagen";
import { validarCampos } from "../Helpers/HelperFunctions";

function Modal_Editar(props) {
    const idFila = props.fila.id;
    const { id, activo, ...filaFiltrada } = props.fila;

    const [editValues, setEditValues] = useState({ ...filaFiltrada });
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState({});

    // Campos que NO se editan
    const Keys_Ignoradas = [
        "codigoParaPedir",
        "rolNombre",
        "nombreMozo",
        "numeroMesa",
        "__aciones"
    ];

    const renderers = {
        imagen: (key) => (
            <Input_Imagen key={key} handleChange={handleChange} />
        ),

        categorias: (key) => (
            <Multiple_Select
                key={key}
                categoriasTotales={props.categoriasTotales}
                titulo="Categorias"
                categoriasActivas={props.categoriasActivas}
                handleChange={handleChange}
            />
        ),

        rol: (key, value) => (
            <Select
                key={key}
                datos_select={props.configSelect.datos}
                datoActual={value}
                name={props.configSelect.name}
                titulo={props.configSelect.titulo}
                handleChange={handleChange}
            />
        ),

        idMozo: (key, value) => (
            <Select
                key={key}
                datos_select={props.configSelect.datos}
                datoActual={value}
                name={props.configSelect.name}
                titulo={props.configSelect.titulo}
                handleChange={handleChange}
            />
        ),
    };

    const defaultRenderer = (key, value) => (
        <Form.Group key={key} className="mb-3">
            <Form.Label>{key}</Form.Label>
            <Form.Control
                value={value || ""}
                onChange={(e) => handleChange(e, key)}
            />
        </Form.Group>
    );

    const handleClose = () => {
        setErrors({});
        setShow(false);
    };
    const handleShow = () => setShow(true);

    const handleChange = (event, key) => {
        const valor = key === "imagen" ? event.target.files[0] : event.target.value;

        setEditValues((prev) => ({
            ...prev,
            [key]: valor,
        }));

        validarCampos(key, valor, setErrors);
    };

    const handleSave = async () => {
        if (Object.keys(errors).length === 0) {
            await props.modificar({ ...editValues, id: idFila });
            handleClose();
            await props.recargarComponentes();
        }
    };

    useEffect(() => {
        if (show) setEditValues({ ...filaFiltrada });
    }, [show]);

    const renderField = (key, value) => {
        if (Keys_Ignoradas.includes(key)) return null;
        return renderers[key]?.(key, value) || defaultRenderer(key, value);
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                <FontAwesomeIcon icon={faPencil} />
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Editar
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {Object.keys(errors).length > 0 && (
                        <div
                            style={{
                                backgroundColor: "#ffe6e6",
                                padding: "10px",
                                marginBottom: "10px",
                                border: "1px solid red",
                            }}
                        >
                            <p>
                                <strong>Errores en el formulario:</strong>
                            </p>
                            <ul>
                                {Object.entries(errors).map(([key, error]) => (
                                    <li key={key} style={{ color: "red" }}>
                                        Campo <b>{key}</b>: {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Form>
                        {Object.entries(editValues).map(([key, value]) =>
                            renderField(key, value)
                        )}
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