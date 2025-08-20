import React, { useEffect, useContext } from 'react'
import Tabla from "../components/Tabla";
import { Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../App';

function Abm_Mozos(props) {
    var cols = ['Código', 'Nombre', 'Apellido', 'DNI', 'Dirección', 'Teléfono', 'Acciones']
    return (
        <Container>
            <Tabla columnas={cols} datos={props.datos_mozos} titulo={props.titulo}></Tabla>
        </Container>
    );
}

export default Abm_Mozos;