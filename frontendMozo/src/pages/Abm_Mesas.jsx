import React, { useEffect, useContext } from 'react'
import Tabla from "../components/Tabla";
import { Container } from 'react-bootstrap'
import { CrearMesa, ModificarMesa, BorrarMesa } from "../API/APIMesas";
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../App';

function Abm_Mesas(props) {
    var cols = ['Número de Mesa', 'Código', 'Mozo', 'Acciones']
    return (
        <Container>
            <Tabla recargarComponentes={props.recargarComponentes} columnas={cols} datos={props.datos_mesas} titulo={props.titulo} titulo_select="Mozo" name_select="nombreMozo" datos_select={props.datos_select}
                agregar={CrearMesa}
                modificar={ModificarMesa}
                eliminar={BorrarMesa}
            ></Tabla>
        </Container>
    );
}

export default Abm_Mesas;