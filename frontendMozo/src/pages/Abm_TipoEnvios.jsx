import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { BuscarTodosLosTipoEnvios, CrearTipoEnvio, EliminarTipoEnvio, ModificarTipoEnvio } from "../API/APITipoEnvios";
import { Campos as CamposAgregar } from "../configs/agregar/TipoEnvios";
import { Campos as CamposEditar } from "../configs/modificar/TipoEnvios";

function Abm_TipoEnvios(props) {
    const [tiposEnvio, setTiposEnvio] = useState([]);
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);

    const recargarComponentes = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const data = await BuscarTodosLosTipoEnvios();
            setTiposEnvio(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al cargar tipos de envío:", error);
            setTiposEnvio([]);
        }
    }, []);

    useEffect(() => {
        recargarComponentes();
    }, [recargarComponentes]);

    useEffect(() => {
        setFilasFiltradas(tiposEnvio);
        setFilasOrdenadas(tiposEnvio);
    }, [tiposEnvio]);

    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const api = useMemo(() => ({
        crear: CrearTipoEnvio,
        modificar: ModificarTipoEnvio,
        eliminar: EliminarTipoEnvio,
    }), []);

    const columnas = useMemo(() => ([
        { key: "nombre", label: "Nombre", align: "right" },
        {
            key: "precio",
            label: "Precio",
            align: "right",
            render: (fila) => `$${Number(fila.precio ?? 0)}`,
        },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Fila_Acciones
                    fila={fila}
                    api={api}
                    recargar={recargarComponentes}
                    showEditar={true}
                    showToggle={() => false}
                    campos={CamposEditar}
                />
            ),
        },
    ]), [api, recargarComponentes]);

    const opcionesOrdenamiento = useMemo(() => ([
        { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' },
        { label: 'Precio', campo: 'precio', tipoOrden: 'numero' }
    ]), []);

    const configuracionFiltros = useMemo(() => ({
        nombre: { tipo: 'text' },
        precio: { tipo: 'number' }
    }), []);

    return (
        <Container>
            <Tabla
                titulo={props.titulo}
                filas={filasOrdenadas}
                columnas={columnas}
                onRefresh={recargarComponentes}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={recargarComponentes}
                        agregar={api.crear}
                        campos={CamposAgregar}
                        nombre="tipo de envío"
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={opcionesOrdenamiento}
                        onOrdenar={setFilasOrdenadas}
                        key={filasFiltradas.length}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={tiposEnvio}
                        columnas={columnas}
                        configuracionFiltros={configuracionFiltros}
                        onFiltrar={setFilasFiltradas}
                        key={tiposEnvio.length}
                    />
                )}
            />
        </Container>
    );
}

export default Abm_TipoEnvios;
