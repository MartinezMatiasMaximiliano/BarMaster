import React from "react";
import { Container } from "react-bootstrap";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modal_Agregar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import {
    CrearProducto,
    BorrarProducto,
    ActivarProducto,
    DesactivarProducto,
    ModificarProducto,
} from "../API/APIProductos";

function Abm_Menu(props) {
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
                    deleteLabel="Producto"
                    categoriasTotales={props.categorias}
                    categoriasActivas={fila.categorias}
                    showToggle={() => true}
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
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={["Imagen", "Nombre", "Precio", "Descripción", "Categorias"]}
                        titulo_select={props.titulo_select}
                        name_select={props.name_select}
                        datos_select={props.datos_select}
                        categorias={props.categorias}
                        agregar={api.crear}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
            />
        </Container>
    );
}

export default Abm_Menu;
