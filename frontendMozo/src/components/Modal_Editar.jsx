import { React, useState, useEffect } from "react"
import { Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import Multiple_Select from "../components/Select_Multiple"
import Select from "../components/Select"
import Input_Imagen from "../components/Input_Imagen";
import { validarCampos } from "../Helpers/HelperFunctions";

function Modal_Editar(props) {
    const idFila = props.fila.id;

    const { id, activo, ...filaFiltrada } = props.fila // Desarmo el objeto y uso filaFiltrada (quitando id y activo)

    const [editValues, setEditValues] = useState({ ...filaFiltrada });

    const [show, setShow] = useState(false);

    // Manejo de errores
    const [errors, setErrors] = useState({});         

    const handleClose = () => {
        setErrors({});
        setShow(false);
    }

    const handleShow = () => setShow(true);

    const handleChange = (event, key) => {
        let valor;
        if (key === "imagen"){
            valor = event.target.files[0];
        } else {
            valor = event.target.value;
        }

        // Actualizo el estado
        setEditValues((prevValues) => ({
            ...prevValues,
            [key]: valor,
        }));
        console.log("edit values: ", editValues);

        // Valido los campos
        validarCampos(key, valor, setErrors);
    }

    const handleSave = async () => {
        if (Object.keys(errors).length === 0) {
            await props.modificar({ ...editValues, id: idFila });
            handleClose();
            await props.recargarComponentes();
        }
        
    };

    // UseEffect para llenar el state 'editValues'

    useEffect(() => {
        if (show) {
            setEditValues({ ...filaFiltrada });
        }
    }, [show]);

    // Keys especiales

    const Keys_Subir_Foto = ["imagen"];
    const Keys_Select_Multiple = ["categorias"]; // Son los campos que quiero que se muestren como select multiple
    const Keys_Select = ["rol", "idMozo"]; // Son los campos que quiero que se muestren como select simple
    const Keys_Ignoradas = ["codigoParaPedir", "rolNombre", "nombreMozo", "numeroMesa"]; // Son los datos que quiero que se vean en la tabla, pero que no quiero que se puedan editar (no se mostrarán en Modal_Editar)

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                <FontAwesomeIcon icon={faPencil} />
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar {props.mensaje} {props.nombre}</Modal.Title>
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
                        {Object.entries(editValues).map(([key, value], i) => (
                            Keys_Subir_Foto.includes(key) ? (
                                <Input_Imagen key={i} handleChange={handleChange}></Input_Imagen>
                            ) :
                            Keys_Select_Multiple.includes(key) ? (
                                <Multiple_Select
                                    key={i}
                                    categorias={props.categorias}
                                    titulo="Categorias"
                                    categoriasActuales={props.activas}
                                    handleChange={handleChange}
                                />
                            ) : Keys_Select.includes(key) ? (
                                <Select
                                    key={i}
                                    datos_select={props.datos_select}
                                    datoActual={value}
                                    name={props.name_select}
                                    titulo={props.titulo_select}
                                    handleChange={handleChange}
                                />
                            ) : Keys_Ignoradas.includes(key) ? (
                                            <div key={i}></div>
                            ) : (
                                <Form.Group key={i} className="mb-3" controlId="exampleForm.ControlInput1">
                                    <Form.Label>{key}</Form.Label>
                                    <Form.Control
                                        value={value}
                                        onChange={(e) => handleChange(e, key)}
                                    />
                                </Form.Group>
                            )
                        ))}

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
