import React, { useContext } from "react"
import { Nav, Row } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from "react-router-dom"
import Modal_Generico from './Modal_Generico';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../App';
import { Chip } from "@mui/material";
import Avatar from '@mui/material/Avatar';

function NavBar(props) {

    const navigate = useNavigate();

    const loginProvider = useContext(LoginContext);

    const nombresAdmin = localStorage.getItem('nombres') || '';
    const apellidoAdmin = localStorage.getItem('apellido') || '';

    const ChipNombreCompleto =
        <Chip avatar={<Avatar>{nombresAdmin?.[0]?.toUpperCase() || ''}</Avatar>}
            label={nombresAdmin + ' ' + apellidoAdmin}
            variant="outlined"
            color="success" />;


    function cerrarSesion() {
        localStorage.removeItem('token');
        loginProvider.setLogeado(false);
        navigate('/');
    }

    const Admin_NavBar = (
        <>
            <Row className="mb-2">
                <Link className="boton-nav" to="/auditoria_caja">
                    Detalles Caja
                </Link>
            </Row>
            <Row className="mb-2">
                <Link className="boton-nav" to="/abm_menu">
                    Gestión de Menu
                </Link>
            </Row>
            <Row className="mb-2">
                <Link className="boton-nav" to="/lista_mozos">
                    Listado de Mozos
                </Link>
            </Row>
            <Row className="mb-2">
                <Link className="boton-nav" to="/abm_personas">
                    Gestión de Personas
                </Link>
            </Row>
            <Row className="mb-2">
                <Link className="boton-nav" to="/abm_mesas">
                    Gestión de Mesas
                </Link>
            </Row>
            <Row className="mb-2">
                <Link className="boton-nav" to="/abm_categorias">
                    Gestión de Categorías
                </Link>
            </Row>
            <Row className="mb-2">
                <Link className="boton-nav" to="/cambiar_clave">
                    Cambiar Contraseña
                </Link>
            </Row>
        </>
    );

    const Boton_Login = (
        <Row className="mb-2">
            <Link className="boton-nav" to="/login">
                Login
            </Link>
        </Row>
    );

    const Boton_Cerrar_Sesion = <Modal_Generico textoBoton="Cerrar sesion" titulo="Cerrar sesion" cuerpo="¿Cerrar sesión?" confirmar={true} func={cerrarSesion} disabled={false}/>

    return (
        <Navbar bg="light" expand="md" className="d-flex flex-column vh-100 position-fixed">
            <Navbar.Brand href="#home" className="me-0">
                <img
                    src="/logo.png"
                    alt="Logo"
                    style={{ height: '25vh', objectFit: 'contain' }}
                />
            </Navbar.Brand>
            <Nav className="flex-column w-100">
                <Nav.Item className="mx-auto">
                    <Row className="mb-2">
                        <Link className="boton-nav" to="/">
                            Mesas
                        </Link>
                    </Row>
                    {loginProvider.logeado ? Admin_NavBar : Boton_Login}
                    {loginProvider.logeado && Boton_Cerrar_Sesion}
                </Nav.Item>
            </Nav>
            {/* Chip al fondo */}
            {loginProvider.logeado && (

                <div className="mt-auto mb-3 d-flex justify-content-center">
                    {ChipNombreCompleto}
                </div>
            )}
        </Navbar>
    );

}

export default NavBar;
