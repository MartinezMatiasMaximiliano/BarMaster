import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import {
    CrearProducto,
    BorrarProducto,
    ActivarProducto,
    DesactivarProducto,
    ModificarProducto,
} from "../API/APIProductos";
import { Campos, inicializarCampos } from "../configs/agregar/Producto"

function Abm_Menu(props) {
    const [campos, setCampos] = useState(Campos);

    // Inicializar campos solo cuando el componente se monte y haya token
    useEffect(() => {
        if (localStorage.getItem('token')) {
            inicializarCampos().then(camposInicializados => {
                setCampos(camposInicializados);
            });
        }
    }, []);

    const api = {
        crear: CrearProducto,
        eliminar: BorrarProducto,
        activar: ActivarProducto,
        desactivar: DesactivarProducto,
        modificar: ModificarProducto,
    };

    const columnas = [
        { key: "imagen", label: "", type: "image", align: "right" },
        { key: "nombre", label: "Nombre", align: "right" },
        { key: "precio", label: "Precio", align: "right" },
        { key: "descripcion", label: "Descripción", align: "right" },
        { key: "categorias", label: "Categorías", align: "right",
        },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Fila_Acciones
                    fila={fila}
                    api={api}
                    recargar={props.recargarComponentes}
                    showEditar={true}
                    showToggle={() => true}
                    campos={campos}
                />
            ),
        },
    ];

    return (
        <Container>
            <Tabla
                titulo={props.titulo}
                filas={props.datos_menu}
                columnas={columnas}
                onRefresh={props.recargarComponentes}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={["Imagen", "Nombre", "Precio", "Descripción", "Categorias"]}
                        agregar={api.crear}
                        campos={campos}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
            />
        </Container>
    );
}

export default Abm_Menu;
