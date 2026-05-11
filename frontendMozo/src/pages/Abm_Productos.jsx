import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
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

function Abm_Productos(props) {
    const [campos, setCampos] = useState(Campos);
    const [filasFiltradas, setFilasFiltradas] = useState(props.datos_productos || []);
    const [filasOrdenadas, setFilasOrdenadas] = useState(props.datos_productos || []);

    // Inicializar campos solo cuando el componente se monte y haya token
    useEffect(() => {
        if (localStorage.getItem('token')) {
            inicializarCampos().then(camposInicializados => {
                setCampos(camposInicializados);
            });
        }
    }, []);

    // Actualizar filas filtradas cuando cambien los datos originales
    useEffect(() => {
        setFilasFiltradas(props.datos_productos || []);
        setFilasOrdenadas(props.datos_productos || []);
    }, [props.datos_productos]);

    // Actualizar filas ordenadas cuando cambien las filas filtradas
    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const api = {
        crear: CrearProducto,
        eliminar: BorrarProducto,
        activar: ActivarProducto,
        desactivar: DesactivarProducto,
        modificar: ModificarProducto,
    };

    const columnas = [
        { key: "imagen", label: "", type: "image", align: "right" },
        { key: "codigo", label: "Código", align: "right" },
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
                filas={filasOrdenadas}
                columnas={columnas}
                onRefresh={props.recargarComponentes}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={["Imagen", "Código", "Nombre", "Precio", "Costo Producción", "Descripción", "Categorias"]}
                        agregar={api.crear}
                        campos={campos}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={[
                            { label: 'Código', campo: 'codigo', tipoOrden: 'texto' },
                            { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' },
                            { label: 'Precio', campo: 'precio', tipoOrden: 'numero' },
                            { label: 'Categorías', campo: 'categorias', tipoOrden: 'texto' }
                        ]}
                        onOrdenar={setFilasOrdenadas}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={props.datos_productos || []}
                        columnas={columnas}
                        configuracionFiltros={{
                            codigo: { tipo: 'text' },
                            nombre: { tipo: 'text' },
                            precio: { tipo: 'number' },
                            descripcion: { tipo: 'text' },
                            categorias: { tipo: 'text' }
                        }}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
            />
        </Container>
    );
}

export default Abm_Productos;
