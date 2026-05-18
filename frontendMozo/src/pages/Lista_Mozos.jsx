import React, { useEffect, useMemo, useState } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Container } from "react-bootstrap";
import Modal_Cambiar_Codigo_Mozo from "../components/Modals/Modal_Cambiar_Codigo_Mozo";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";

function Abm_Mozos(props) {
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);

    const mozosActivos = useMemo(() => {
        return (props.datos_mozos || []).filter((mozo) => mozo.activo === true);
    }, [props.datos_mozos]);

    useEffect(() => {
        setFilasFiltradas(mozosActivos);
        setFilasOrdenadas(mozosActivos);
    }, [mozosActivos]);

    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const columnas = useMemo(() => ([
        { key: "codigoDeServicio", label: "Código" },
        { key: "nombre", label: "Nombre" },
        { key: "apellido", label: "Apellido" },
        { key: "dni", label: "DNI" },
        { key: "direccion", label: "Dirección" },
        { key: "telefono", label: "Teléfono" },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Modal_Cambiar_Codigo_Mozo datos={fila} recargarComponentes={props.recargarComponentes} />
            ),
        },
    ]), [props.recargarComponentes]);

    const opcionesOrdenamiento = useMemo(() => ([
        { label: 'Código', campo: 'codigoDeServicio', tipoOrden: 'texto' },
        { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' },
        { label: 'Apellido', campo: 'apellido', tipoOrden: 'texto' },
        { label: 'DNI', campo: 'dni', tipoOrden: 'numero' },
        { label: 'Teléfono', campo: 'telefono', tipoOrden: 'texto' }
    ]), []);

    const configuracionFiltros = useMemo(() => ({
        codigoDeServicio: { tipo: 'text' },
        nombre: { tipo: 'text' },
        apellido: { tipo: 'text' },
        dni: { tipo: 'text' },
        direccion: { tipo: 'text' },
        telefono: { tipo: 'text' }
    }), []);

    return (
        <Container>
            <Tabla
                onRefresh={props.recargarComponentes}
                titulo={props.titulo}
                columnas={columnas}
                filas={filasOrdenadas}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={opcionesOrdenamiento}
                        onOrdenar={setFilasOrdenadas}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={mozosActivos}
                        columnas={columnas}
                        configuracionFiltros={configuracionFiltros}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
            />
        </Container>
    );
}

export default Abm_Mozos;
