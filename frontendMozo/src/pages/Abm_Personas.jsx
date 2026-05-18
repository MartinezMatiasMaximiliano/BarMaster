import React, { useState, useEffect, useMemo } from "react";
import Tabla from "../components/Tabla/Tabla";
import { Container } from "react-bootstrap";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import {
    RegistrarPersona,
    BorrarPersona,
    DesactivarPersona,
    ActivarPersona,
    ModificarPersona
} from "../API/APIPersonas";
import { Campos, inicializarCampos } from "../configs/agregar/Personas";

function Abm_Personas(props) {
    const [campos, setCampos] = useState([]);
    const personas = useMemo(() => props.datos_personas || [], [props.datos_personas]);
    const rolesSelect = useMemo(() => (
        props.datos_select ? props.datos_select.map(rol => ({ id: rol.id, nombre: rol.nombre })) : []
    ), [props.datos_select]);
    const [filasFiltradas, setFilasFiltradas] = useState(personas);
    const [filasOrdenadas, setFilasOrdenadas] = useState(personas);

    // Inicializar campos cuando cambien los datos_select (roles)
    useEffect(() => {
        const camposInicializados = inicializarCampos(props.datos_select || []);
        setCampos(camposInicializados);
    }, [props.datos_select]);

    // Actualizar filas filtradas cuando cambien los datos originales
    useEffect(() => {
        setFilasFiltradas(personas);
        setFilasOrdenadas(personas);
    }, [personas]);

    // Actualizar filas ordenadas cuando cambien las filas filtradas
    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const api = useMemo(() => ({
        crear: RegistrarPersona,
        eliminar: BorrarPersona,
        activar: ActivarPersona,
        desactivar: DesactivarPersona,
        modificar: ModificarPersona,
    }), []);

    const columnas = useMemo(() => ([
        { key: "nombre", label: "Nombre" }, 
        { key: "apellido", label: "Apellido" },
        { key: "dni", label: "DNI" },
        { key: "direccion", label: "Dirección" },
        { key: "telefono", label: "Teléfono" },
        { key: "email", label: "Email" },
        { key: "rolNombre", label: "Rol" },
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
    ]), [api, campos, props.recargarComponentes]);

    const opcionesOrdenamiento = useMemo(() => ([
        { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' },
        { label: 'Apellido', campo: 'apellido', tipoOrden: 'texto' },
        { label: 'DNI', campo: 'dni', tipoOrden: 'numero' },
        { label: 'Email', campo: 'email', tipoOrden: 'texto' },
        { label: 'Rol', campo: 'rolNombre', tipoOrden: 'texto' }
    ]), []);

    const configuracionFiltros = useMemo(() => ({
        nombre: { tipo: 'text' },
        apellido: { tipo: 'text' },
        dni: { tipo: 'text' },
        direccion: { tipo: 'text' },
        telefono: { tipo: 'text' },
        email: { tipo: 'text' },
        rolNombre: {
            tipo: 'select',
            opciones: rolesSelect
        }
    }), [rolesSelect]);

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
                        columnas={['Nombre', 'Apellido', 'DNI', 'Dirección', 'Teléfono', 'Email', 'Rol']}
                        agregar={api.crear}
                        campos={campos}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={opcionesOrdenamiento}
                        onOrdenar={setFilasOrdenadas}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={personas}
                        columnas={columnas}
                        configuracionFiltros={configuracionFiltros}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
            />
        </Container>
    );
}

export default Abm_Personas;
