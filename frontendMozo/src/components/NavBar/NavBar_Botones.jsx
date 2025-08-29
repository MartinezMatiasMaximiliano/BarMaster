import React from "react";
import { Link } from "react-router-dom";
import Modal_Generico from "../Modal_Generico";
import { Nav, Row } from 'react-bootstrap';

const menuConfig = {
    Encargado: [
        { path: "/auditoria_caja", label: "Detalles Caja" },
        { path: "/abm_menu", label: "Gestión de Menu" },
        { path: "/lista_mozos", label: "Listado de Mozos" },
        { path: "/abm_personas", label: "Gestión de Personas" },
        { path: "/abm_mesas", label: "Gestión de Mesas" },
        { path: "/abm_categorias", label: "Gestión de Categorías" },
        { path: "/cambiar_clave", label: "Cambiar Contraseña" },
    ],
    Cajero: [
        { path: "/abm_menu", label: "Gestión de Menu" },
        { path: "/cambiar_clave", label: "Cambiar Contraseña" },
    ],
};

function NavBar_Botones(props) {

    if (!props.logeado) {
        return (
            <Nav className="flex-column">
                <Row className="mb-2">
                    <Link className="boton-nav" to="/login">
                        Login
                    </Link>
                </Row>
            </Nav>
        );
    }

    return (
        <>
            {(menuConfig[props.rol] || []).map((item) => (
                <Row key={item.path} className="mb-2">
                    <Link className="boton-nav" to={item.path}>
                        {item.label}
                    </Link>
                </Row>
            ))}
            <Modal_Generico
                textoBoton="Cerrar sesion"
                titulo="Cerrar sesion"
                cuerpo="¿Cerrar sesión?"
                confirmar={true}
                func={props.cerrarSesion}
                disabled={false}
            />
        </>
    );


}

export default NavBar_Botones;
