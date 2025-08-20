import React, {useEffect, useContext} from 'react'
import Tabla from "../components/Tabla";
import { Container } from 'react-bootstrap'
import { CrearCategoria, BorrarCategoria, DesactivarCategoria, ActivarCategoria, ModificarCategoria } from "../API/APICategorias";
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../App';

function Abm_Categorias(props) {
    var cols = ['Nombre', 'Acciones']
    return (
        <Container>
            <Tabla recargarComponentes={props.recargarComponentes} columnas={cols} datos={props.datos_categorias} titulo={props.titulo}
                agregar={CrearCategoria}
                eliminar={BorrarCategoria}
                desactivar={DesactivarCategoria}
                activar={ActivarCategoria}
                modificar={ModificarCategoria} ></Tabla>
        </Container>
    );
}

export default Abm_Categorias;
