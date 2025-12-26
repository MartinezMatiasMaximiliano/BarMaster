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
import { Campos as Campos_Agregar } from "../configs/agregar/Mesas"
import { Campos as Campos_Editar, inicializarCampos } from "../configs/modificar/Mesas"

function Abm_Mesas(props) {
    const [camposEditar, setCamposEditar] = useState(Campos_Editar);
    const [filasFiltradas, setFilasFiltradas] = useState(props.datos_mesas || []);
    const [filasOrdenadas, setFilasOrdenadas] = useState(props.datos_mesas || []);

    // Inicializar campos solo cuando el componente se monte y haya token
    useEffect(() => {
        if (localStorage.getItem('token')) {
            inicializarCampos().then(campos => {
                setCamposEditar(campos);
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
                        columnas={["Número de Mesa", "Código", "Mozo"]}
                        agregar={api.crear}
                        campos={Campos_Agregar}
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
