import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LoginContext } from "../../App";
import { Nav, Row } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import NavBar_Botones from '../Navbar/NavBar_Botones'
import NavBar_Chip from '../Navbar/NavBar_Chip'
function NavBar() {

    const loginProvider = useContext(LoginContext);

    function cerrarSesion() {
        localStorage.clear();
        loginProvider.setLogeado(false);
        loginProvider.setRol("");
    }

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
                    <NavBar_Botones
                        logeado={loginProvider.logeado}
                        rol={loginProvider.rol}
                        cerrarSesion={cerrarSesion}
                    ></NavBar_Botones>
                </Nav.Item>
            </Nav>
            {/* Chip al fondo */}
            <NavBar_Chip logeado={ loginProvider.logeado }></NavBar_Chip>
        </Navbar>
    );
}

export default NavBar;
