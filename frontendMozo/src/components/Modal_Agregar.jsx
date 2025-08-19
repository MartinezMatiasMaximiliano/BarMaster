import { React, useState, useEffect } from "react"
import { Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import Multiple_Select from "../components/Select_Multiple";
import Input_Imagen from "../components/Input_Imagen";
import Select from "../components/Select";
import { validarCampos } from "../Helpers/HelperFunctions";
import { useNavigate, useLocation } from 'react-router-dom';

function Modal_Agregar(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const columnas = props.columnas;

    const [show, setShow] = useState(false);
    const [values, setValues] = useState({});

    // Manejo de errores
    const [errors, setErrors] = useState({});

    const handleClose = () => {
        setErrors({});
        setShow(false);
    }
    const handleShow = () => setShow(true);

    const handleChange = (event, key) => {
        let valor;
        switch (key) { 
            case "rol":
                valor = {
                    id: event.target.value,
                    nombre: ''
                };
                break;
            case "imagen":
                valor = event.target.files[0];
                break;
            default:
                valor = event.target.value;
                break;
        }

        // Actualizo el state
        setValues((prevValues) => ({
            ...prevValues,
            [key]: valor,
        }));

        // Hago la validacion
        validarCampos(key, valor, setErrors);
    }

    const handleSave = async () => {
        if (Object.keys(errors).length === 0) {
            await props.agregar(values);
            // Cerrar el modal después de guardar
            handleClose();
            await props.recargarComponentes();
        }
    };

    const Keys_Subir_Foto = ["Imagen"];
    const Keys_Select_Multiple = ["Categorias"];
    const Keys_Select = ["Rol"];
    const Keys_Ignoradas = ["Código", "Mozo"]; // Son los datos que quiero que se vean en la tabla, pero que no quiero que se puedan elegir al agregar (no se mostrarán en Modal_Agregar)

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
                        {columnas.map((col, index) => (
                            Keys_Subir_Foto.includes(col) ? (
                                <Input_Imagen key={index} handleChange={handleChange}></Input_Imagen>
                            ) : 
                            Keys_Select_Multiple.includes(col) ? (
                                <Multiple_Select
                                    key={index}
                                    categorias={props.categorias}
                                    titulo="Categorias"
                                    categoriasActuales={[]}
                                    handleChange={handleChange}
                                />
                            ) : Keys_Select.includes(col) ? (
                                <Select
                                    key={index}
                                    datos_select={props.datos_select}
                                    datoActual=""
                                    titulo={props.titulo_select}
                                    name={props.name_select}
                                    handleChange={handleChange}
                                />
                            ) : Keys_Ignoradas.includes(col) ? (
                                            <div key={index}></div>
                            ) : (
                                <Form.Group
                                    className="mb-3"
                                    key={index}
                                    controlId={`categoria-${index}`}
                                >
                                    <Form.Label>{col}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder={`Ingrese valor para ${col}`}
                                        onChange={(e) => handleChange(e, col)}
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
                        Agregar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Modal_Agregar;
