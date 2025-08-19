import React, { useEffect, useContext } from 'react'
import Tabla from "../components/Tabla";
import { Container } from 'react-bootstrap'
import { RegistrarPersona, BorrarPersona, DesactivarPersona, ActivarPersona, ModificarPersona } from "../API/APIPersonas";
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

    var cols = ['Nombre', 'Apellido', 'DNI', 'Dirección', 'Teléfono', 'Rol', 'Acciones']
    return (
        <Container>
            <Tabla recargarComponentes={props.recargarComponentes} columnas={cols} datos={props.datos_personas} titulo={props.titulo} titulo_select="Rol" name_select="rol" datos_select={props.datos_select}
                agregar={RegistrarPersona}
                eliminar={BorrarPersona}
                desactivar={DesactivarPersona}
                activar={ActivarPersona}
                modificar={ModificarPersona}></Tabla>
        </Container>
    );
}

export default Abm_Menu;