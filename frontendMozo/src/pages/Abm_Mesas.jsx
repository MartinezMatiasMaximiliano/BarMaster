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
    CrearMesa,
    ModificarMesa,
    BorrarMesa,
} from "../API/APIMesas";
import { Campos as Campos_Agregar, inicializarCampos as inicializarCamposAgregar } from "../configs/agregar/Mesas"
import { Campos as Campos_Editar, inicializarCampos } from "../configs/modificar/Mesas"
import { BuscarTodosLosPlanos } from "../API/APIPlanos";

function Abm_Mesas(props) {
    const [camposEditar, setCamposEditar] = useState(Campos_Editar);
    const [camposAgregar, setCamposAgregar] = useState(Campos_Agregar);
    const [opcionesPlanos, setOpcionesPlanos] = useState([]);
    const [filasFiltradas, setFilasFiltradas] = useState(props.datos_mesas || []);
    const [filasOrdenadas, setFilasOrdenadas] = useState(props.datos_mesas || []);

    // Inicializar campos y planos solo cuando el componente se monte y haya token
    useEffect(() => {
        if (localStorage.getItem('token')) {
            // Cargar campos de edición y agregar en paralelo
            Promise.all([
                inicializarCampos(),
                inicializarCamposAgregar(),
                BuscarTodosLosPlanos()
            ]).then(([camposEdit, camposAdd, planosData]) => {
                setCamposEditar(camposEdit);
                setCamposAgregar(camposAdd);
                
                // Preparar opciones de planos para el filtro
                const opciones = (planosData || []).map(p => ({ id: p.id, nombre: p.nombre }));
                setOpcionesPlanos(opciones);
            });
        }
    }, []);

    // Actualizar filas filtradas cuando cambien los datos originales
    React.useEffect(() => {
        setFilasFiltradas(props.datos_mesas || []);
        setFilasOrdenadas(props.datos_mesas || []);
    }, [props.datos_mesas]);

    // Actualizar filas ordenadas cuando cambien las filas filtradas
    React.useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const api = {
        crear: CrearMesa,
        modificar: ModificarMesa,
        eliminar: BorrarMesa,
    };

    const columnas = [
        { key: "numero", label: "Número de Mesa", align: "right" },
        { key: "codigoParaPedir", label: "Código", align: "right" },
        { key: "nombrePlano", label: "Plano", align: "right" },
        { key: "nombreMozo", label: "Mozo", align: "right" },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Fila_Acciones
                    fila={fila}
                    api={api}
                    recargar={props.recargarComponentes}
                    showEditar={fila.codigoParaPedir}
                    showToggle={() => false} // las mesas no se activan/desactivan
                    campos={camposEditar}
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
                        columnas={["Número de Mesa", "Código", "Plano", "Mozo"]}
                        agregar={api.crear}
                        campos={camposAgregar}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={[
                            { label: 'Número de Mesa', campo: 'numero', tipoOrden: 'numero' },
                            { label: 'Código', campo: 'codigoParaPedir', tipoOrden: 'texto' },
                            { label: 'Plano', campo: 'nombrePlano', tipoOrden: 'texto' },
                            { label: 'Mozo', campo: 'nombreMozo', tipoOrden: 'texto' }
                        ]}
                        onOrdenar={setFilasOrdenadas}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={props.datos_mesas || []}
                        columnas={columnas}
                        configuracionFiltros={{
                            numero: { tipo: 'number' },
                            codigoParaPedir: { tipo: 'text' },
                            nombrePlano: { 
                                tipo: 'select', 
                                opciones: opcionesPlanos
                            },
                            nombreMozo: { tipo: 'text' }
                        }}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
            />
        </Container>
    );
}

export default Abm_Mesas;
