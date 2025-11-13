import React from "react";
import { Link } from "react-router-dom";
import Modal_Generico from "../Modals/Modal_Generico";
import { Nav, Row } from 'react-bootstrap';

const menuConfig = {
    Encargado: [
        { path: "/abm_menu", label: "ABM MENU" },
        { path: "/abm_mesas", label: "ABM Mesas" },
        { path: "/abm_categorias", label: "ABM Categorías" },
        { path: "/abm_personas", label: "ABM Personas" },
        { path: "/delivery_takeaway", label: "Delivery/Take Away" },
        { path: "/lista_mozos", label: "Listado de Mozos" },
        { path: "/distribucion_mesas", label: "Distribución de las Mesas" },
        { path: "/caja", label: "Caja" },
        { path: "/cambiar_clave", label: "Cambiar Contraseña" },
        { path: "/graficas", label: "Graficas" },
        { path: "/mi_plan", label: "Mi Plan" },
    ],
    Cajero: [
        { path: "/abm_menu", label: "Gestión de Menu" },
        { path: "/delivery_takeaway", label: "Delivery/Take Away" },
        { path: "/lista_mozos", label: "Listado de Mozos" },
        { path: "/abm_mesas", label: "Gestión de Mesas" },
        { path: "/distribucion_mesas", label: "Distribución de las Mesas" },
        { path: "/caja", label: "Caja" },
        { path: "/abm_categorias", label: "Gestión de Categorías" },
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
