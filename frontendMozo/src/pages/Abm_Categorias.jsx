import React, { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { CrearCategoria, BorrarCategoria, DesactivarCategoria, ActivarCategoria, ModificarCategoria } from "../API/APICategorias";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { Campos } from "../configs/agregar/Categorias"

function Abm_Categorias(props) {
    const [filasFiltradas, setFilasFiltradas] = useState(props.datos_categorias || []);
    const [filasOrdenadas, setFilasOrdenadas] = useState(props.datos_categorias || []);

    // Actualizar filas filtradas cuando cambien los datos originales
    useEffect(() => {
        setFilasFiltradas(props.datos_categorias || []);
        setFilasOrdenadas(props.datos_categorias || []);
    }, [props.datos_categorias]);

    // Actualizar filas ordenadas cuando cambien las filas filtradas
    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const api = {
        crear: CrearCategoria,
        eliminar: BorrarCategoria,
        desactivar: DesactivarCategoria,
        activar: ActivarCategoria,
        modificar: ModificarCategoria,
    };

    const columnas = [

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
                    showEditar={true}
                    showToggle={() => true} // en Categorías sí mostramos Switch
                    campos={Campos}
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
                        agregar={api.crear}
                        campos={Campos}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={[
                            { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' }
                        ]}
                        onOrdenar={setFilasOrdenadas}
                        key={filasFiltradas.length} // Forzar re-render cuando cambien las filas filtradas
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={props.datos_categorias || []}
                        columnas={columnas}
                        configuracionFiltros={{
                            nombre: { tipo: 'text' }
                        }}
                        onFiltrar={setFilasFiltradas}
                        key={props.datos_categorias?.length} // Forzar re-render cuando cambien los datos
                    />
                )}
            />
        </Container>
    );
}

export default Abm_Categorias;
