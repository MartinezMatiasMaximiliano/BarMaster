import React, { useState, useEffect } from "react";
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
import { Campos, inicializarCampos } from "../configs/agregar/Personas"

function Abm_Personas(props) {
    const [campos, setCampos] = useState(Campos);
    const [filasFiltradas, setFilasFiltradas] = useState(props.datos_personas || []);
    const [filasOrdenadas, setFilasOrdenadas] = useState(props.datos_personas || []);

    // Inicializar campos solo cuando el componente se monte y haya token
    useEffect(() => {
        if (localStorage.getItem('token')) {
            inicializarCampos().then(camposInicializados => {
                setCampos(camposInicializados);
            });
        }
    }, []);

    // Actualizar filas filtradas cuando cambien los datos originales
    React.useEffect(() => {
        setFilasFiltradas(props.datos_personas || []);
        setFilasOrdenadas(props.datos_personas || []);
    }, [props.datos_personas]);

    // Actualizar filas ordenadas cuando cambien las filas filtradas
    React.useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const api = {
        crear: RegistrarPersona,
        eliminar: BorrarPersona,
        activar: ActivarPersona,
        desactivar: DesactivarPersona,
        modificar: ModificarPersona,
    };

    const columnas = [
        { key: "nombre", label: "Nombre" }, 
        { key: "apellido", label: "Apellido" },
        { key: "dni", label: "DNI" },
        { key: "direccion", label: "Dirección" },
        { key: "telefono", label: "Teléfono" },
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
                        columnas={['Nombre', 'Apellido', 'DNI', 'Dirección', 'Teléfono', 'Rol']}
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
                            { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' },
                            { label: 'Apellido', campo: 'apellido', tipoOrden: 'texto' },
                            { label: 'DNI', campo: 'dni', tipoOrden: 'numero' },
                            { label: 'Rol', campo: 'rolNombre', tipoOrden: 'texto' }
                        ]}
                        onOrdenar={setFilasOrdenadas}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={props.datos_personas || []}
                        columnas={columnas}
                        configuracionFiltros={{
                            nombre: { tipo: 'text' },
                            apellido: { tipo: 'text' },
                            dni: { tipo: 'text' },
                            direccion: { tipo: 'text' },
                            telefono: { tipo: 'text' },
                            rolNombre: { 
                                tipo: 'select',
                                opciones: props.datos_select ? props.datos_select.map(rol => ({ id: rol.id, nombre: rol.nombre })) : []
                            }
                        }}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
            />
        </Container>
    );
}

export default Abm_Personas;