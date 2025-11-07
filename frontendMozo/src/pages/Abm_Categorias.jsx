import React from 'react'
import { Container } from 'react-bootstrap'
import { CrearCategoria, BorrarCategoria, DesactivarCategoria, ActivarCategoria, ModificarCategoria } from "../API/APICategorias";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar/Index";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import {Campos} from "../configs/abms/Categorias"

function Abm_Categorias(props) {
    const api = {
        crear: CrearCategoria,
        eliminar: BorrarCategoria,
        desactivar: DesactivarCategoria,
        activar: ActivarCategoria,
        modificar: ModificarCategoria,
    };

    const columnas = [
        // Si tu dataset tiene imagen, podés agregar esta columna como type:'image'
        // { key: 'imagen', label: '', type: 'image', align: 'right' },

        { key: "nombre", label: "Nombre", align: "right" },

        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Fila_Acciones
                    fila={fila}
                    api={api}
                    recargar={props.recargarComponentes}
                    deleteLabel="Categorías"
                    showToggle={() => true} // en Categorías sí mostramos Switch
                />
            ),
        },
    ];

    return (
        <Container>
            <Tabla
                titulo={props.titulo}
                filas={props.datos_categorias}
                columnas={columnas}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={["Nombre"]} // las que querés en el formulario de “Agregar”
                        titulo_select={props.titulo_select}
                        name_select={props.name_select}
                        datos_select={props.datos_select}
                        categorias={props.categorias}
                        agregar={api.crear}
                        campos={Campos}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
            />
        </Container>
    );
}

export default Abm_Categorias;
