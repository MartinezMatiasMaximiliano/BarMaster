/* eslint-disable react-hooks/exhaustive-deps */
import { React, useContext, useState, useEffect } from 'react'
import Mesa from "../components/Mesa";
import { Container, Form } from 'react-bootstrap';
import { modificar as modificarMozo } from '../redux/slices/mozoSlice';
import { modificar as modificarCodigoMozo } from '../redux/slices/codigoMozoSlice';
import { useSelector, useDispatch } from 'react-redux'
import { Chip } from "@mui/material";
import { GetChipNombreCompleto } from '../Helpers/HelperFunctions';

function Index(props) {

    const dispatch = useDispatch();

    const mozo = useSelector((state) => state.mozo.value); 

    const codigoMozo = useSelector((state) => state.codigoMozo.value);

    const estiloMesas = {
        width: "7vw",
        height: "10vh",
        minWidth: "80px",
        minHeight: "80px",
        maxWidth: "120px",
        maxHeight: "120px",
    };

    const [ListaMesas, setListaMesas] = useState([]);

    const [ListaMesasFiltradas, setListaMesasFiltradas] = useState(undefined);

    const handleChange = (event) => {
        dispatch(modificarCodigoMozo(event.target.value));
    }

    useEffect(() => {
        filtrarMesas();
    }, [props.datos_mozos, mozo]);

    useEffect(() => {
        ComprobarCodigo();
    }, [codigoMozo])

    useEffect(() => {
        setListaMesas(props.mesas.map((mesa, i) => {
            return (
                <Mesa
                    key={i}
                    datos_mesa={mesa}
                    estilo={estiloMesas}
                />
            );
        }));
    }, [props.mesas]);

    function filtrarMesas() {
        if (mozo) {
            setListaMesasFiltradas(props.mesas.map((mesa, i) => {
                var variant;
                mesa.persona ? mesa.persona.codigoDeServicio === mozo.codigoDeServicio ? variant = "success" : variant = "primary" : variant = "secondary";
                return (
                    <Mesa
                        key={i}
                        datos_mesa={mesa}
                        variant={variant}
                        mozo={mozo}
                        estilo={estiloMesas}
                    />
                );
            }));
        } else {
            setListaMesasFiltradas(undefined);
        }
    }

    function ComprobarCodigo() {
        if (props.datos_mozos.length > 0) {
            dispatch(modificarMozo((props.datos_mozos.find(mozo => mozo.codigoDeServicio === codigoMozo))));
        }
    }


    return (
        <Container className="position-relative" style={{ height: "98vh" }}>
            <div className="row pt-4 g-3">
                {(ListaMesasFiltradas || ListaMesas).map((mesa, i) => (
                    <div className="col-6 col-md-4 col-lg-3 d-flex justify-content-center" key={i}>
                        {mesa}
                    </div>
                ))}
            </div>


            <div className="position-absolute bottom-0 start-0 w-100 p-3 d-flex align-items-end gap-3">
                <Form.Group controlId="exampleForm.ControlInput1" className="mb-0">
                    <Form.Label>Código</Form.Label>
                    <Form.Control
                        onChange={(e) => handleChange(e)}
                        type="password"
                        value={codigoMozo}
                        className="w-100"
                    />
                </Form.Group>
                {mozo?.nombre ? GetChipNombreCompleto(mozo.nombre, mozo.apellido) : (<Chip label="Codigo incorrecto" variant="outlined" color="error" />)}
            </div>

        </Container>

    );
}

export default Index;
