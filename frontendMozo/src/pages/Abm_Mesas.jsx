import React, { useMemo, useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Box, FormControl, InputLabel, Select, MenuItem, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import {
    CrearMesa,
    ModificarMesa,
    BorrarMesa,
} from "../API/APIMesas";
import { Campos as Campos_Agregar, inicializarCampos as inicializarCamposAgregar } from "../configs/agregar/Mesas"
import { Campos as Campos_Editar, inicializarCampos as inicializarCamposEditar } from "../configs/modificar/Mesas"
import { MappearMesas } from "../Helpers/HelperFunctions";

function Abm_Mesas(props) {
    const [camposEditar, setCamposEditar] = useState(Campos_Editar);
    const [camposAgregar, setCamposAgregar] = useState(Campos_Agregar);
    const [planoSeleccionado, setPlanoSeleccionado] = useState('');

    // Inicializar campos de edición y agregar solo cuando el componente se monte y haya token
    useEffect(() => {
        const cargarCampos = async () => {
            if (localStorage.getItem('token')) {
                try {
                    const camposInicializadosEditar = await inicializarCamposEditar();
                    setCamposEditar(camposInicializadosEditar);

                    const camposInicializadosAgregar = await inicializarCamposAgregar();
                    setCamposAgregar(camposInicializadosAgregar);
                } catch (error) {
                    console.error('Error al inicializar campos:', error);
                }
            }
        };
        cargarCampos();
    }, []);

    const api = {
        crear: CrearMesa,
        modificar: ModificarMesa,
        eliminar: BorrarMesa,
    };

    // Obtener todas las mesas de todos los planos en una lista plana
    const todasLasMesas = useMemo(() => {
        const mesas = [];
        (props.datos_mesas || []).forEach((plano) => {
            (plano.mesas || []).forEach(mesa => {
                const mesaMapeada = MappearMesas([{
                    ...mesa,
                    nombrePlano: plano.nombre,
                    idPlano: plano.id
                }])[0];
                mesas.push(mesaMapeada);
            });
        });
        return mesas;
    }, [props.datos_mesas]);

    // Filtrar mesas por plano seleccionado
    const mesasFiltradas = useMemo(() => {
        if (!planoSeleccionado || planoSeleccionado === '') {
            return todasLasMesas;
        }
        return todasLasMesas.filter(mesa => String(mesa.idPlano) === String(planoSeleccionado));
    }, [planoSeleccionado, todasLasMesas]);

    // Obtener opciones de planos para el filtro
    const opcionesPlanos = useMemo(() => {
        const planosUnicos = new Map();
        (props.datos_mesas || []).forEach(plano => {
            if (!planosUnicos.has(plano.id)) {
                planosUnicos.set(plano.id, {
                    id: plano.id,
                    nombre: plano.nombre
                });
            }
        });
        return Array.from(planosUnicos.values());
    }, [props.datos_mesas]);

    // Columnas simples sin grupos
    const columnas = [
        { 
            key: "numero", 
            label: "Número de Mesa", 
            align: "right"
        },
        { 
            key: "nombrePlano", 
            label: "Plano", 
            align: "right"
        },
        { 
            key: "capacidad", 
            label: "Capacidad", 
            align: "right"
        },
        { 
            key: "codigoParaPedir", 
            label: "Código", 
            align: "right",
            render: (fila) => fila.codigoParaPedir || "-"
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
                    showToggle={() => false}
                    campos={camposEditar}
                />
            ),
        },
    ];

    return (
        <Container>
            <Tabla
                titulo={props.titulo}
                filas={mesasFiltradas}
                columnas={columnas}
                onRefresh={props.recargarComponentes}
                mostrarExportacion={false}
                renderAgregar={() => (
                    <Modal_Agregar
                        recargarComponentes={props.recargarComponentes}
                        columnas={["Número de Mesa", "Plano"]}
                        agregar={api.crear}
                        campos={camposAgregar}
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
                renderFiltros={() => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel id="filtro-plano-label">Seleccionar Plano</InputLabel>
                            <Select
                                labelId="filtro-plano-label"
                                id="filtro-plano"
                                value={planoSeleccionado}
                                label="Seleccionar Plano"
                                onChange={(e) => setPlanoSeleccionado(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>Ver todas las mesas</em>
                                </MenuItem>
                                {opcionesPlanos.map((plano) => (
                                    <MenuItem key={plano.id} value={plano.id}>
                                        {plano.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {planoSeleccionado && (
                            <IconButton
                                size="small"
                                onClick={() => setPlanoSeleccionado('')}
                                sx={{ color: 'text.secondary' }}
                                title="Limpiar filtro"
                            >
                                <ClearIcon />
                            </IconButton>
                        )}
                    </Box>
                )}
            />
        </Container>
    );
}

export default Abm_Mesas;
