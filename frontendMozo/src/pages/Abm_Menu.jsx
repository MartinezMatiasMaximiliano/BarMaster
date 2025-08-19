import React, { useEffect, useContext } from 'react'
import Tabla from "../components/Tabla";
import { Container } from 'react-bootstrap'
import { CrearProducto, BorrarProducto, ActivarProducto, DesactivarProducto, ModificarProducto } from "../API/APIProductos";
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../App';

function Abm_Menu(props) {
    const navigate = useNavigate(); // useNavigate se usa para redirigir a los usuarios a una nueva ruta cuando ocurre un evento.
    const loginProvider = useContext(LoginContext);

    useEffect(() => {
        if (loginProvider.logeado == false) {
            navigate('/')
        }
    }, [])

    var cols = ['Imagen', 'Nombre', 'Precio', 'Descripción', 'Categorias', 'Acciones']
    return (
        <Container>
            <Tabla recargarComponentes={props.recargarComponentes} columnas={cols} datos={props.datos_menu} titulo={props.titulo} categorias={props.categorias}
                agregar={CrearProducto}
                activar={ActivarProducto}
                desactivar={DesactivarProducto}
                eliminar={BorrarProducto}
                modificar={ModificarProducto}></Tabla>
        </Container>
    );
}

export default Abm_Menu;
