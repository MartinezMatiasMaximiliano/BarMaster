import React, { useMemo, useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Box, Chip, FormControl, InputLabel, Select, MenuItem, IconButton } from "@mui/material";
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
    const [planoFiltrado, setPlanoFiltrado] = useState([]);
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
                    // Error al inicializar campos
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


    // Crear filas con encabezados de grupo directamente desde los planos
    const filasConGrupos = useMemo(() => {
        const filas = [];
        (props.datos_mesas || []).forEach((plano, planoIndex) => {
            // Agregar fila de encabezado del grupo (plano)
            filas.push({
                id: `grupo-${plano.id}-${planoIndex}`,
                esGrupo: true,
                nombrePlano: plano.nombre,
                idPlano: plano.id,
                cantidad: (plano.mesas || []).length
            });
            // Agregar las mesas del plano, mapeadas correctamente
            (plano.mesas || []).forEach(mesa => {
                const mesaMapeada = MappearMesas([{
                    ...mesa,
                    nombrePlano: plano.nombre,
                    idPlano: plano.id
                }])[0];
                filas.push(mesaMapeada);
            });
        });
        return filas;
    }, [props.datos_mesas]);

    // Obtener mesas sin grupos
    const mesasSinGrupos = useMemo(() => {
        return filasConGrupos.filter(f => !f.esGrupo);
    }, [filasConGrupos]);

    // Filtrar mesas por plano seleccionado
    useEffect(() => {
        if (!planoSeleccionado || planoSeleccionado === '') {
            setPlanoFiltrado([]);
        } else {
            // Filtrar mesas por idPlano
            const mesasFiltradas = mesasSinGrupos.filter(mesa => {
                return String(mesa.idPlano) === String(planoSeleccionado);
            });
            setPlanoFiltrado(mesasFiltradas);
        }
    }, [planoSeleccionado, mesasSinGrupos]);

    // Determinar qué filas mostrar: planoFiltrado si tiene datos, sino filasConGrupos
    const filasAMostrar = useMemo(() => {
        return planoFiltrado.length > 0 ? planoFiltrado : filasConGrupos;
    }, [planoFiltrado, filasConGrupos]);

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

    // Columnas con render personalizado para grupos
    const columnasConGrupos = [
        { 
            key: "numero", 
            label: "Número de Mesa", 
            align: "right",
            render: (fila) => {
                if (fila.esGrupo) {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                            <Chip 
                                label={fila.nombrePlano} 
                                color="primary" 
                                variant="outlined"
                                sx={{ fontWeight: 'bold' }}
                            />
                            <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                ({fila.cantidad} {fila.cantidad === 1 ? 'mesa' : 'mesas'})
                            </Box>
                        </Box>
                    );
                }
                return fila.numero || "";
            }
        },
        { 
            key: "codigoParaPedir", 
            label: "Código", 
            align: "right",
            render: (fila) => fila.esGrupo ? "" : (fila.codigoParaPedir || "")
        },
        { 
            key: "nombreMozo", 
            label: "Mozo", 
            align: "right",
            render: (fila) => fila.esGrupo ? "" : (fila.nombreMozo || "Sin Mozo")
        },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => {
                if (fila.esGrupo) return "";
                return (
                    <Fila_Acciones
                        fila={fila}
                        api={api}
                        recargar={props.recargarComponentes}
                        showEditar={true}
                        showToggle={() => false}
                        campos={camposEditar}
                    />
                );
            },
        },
    ];

    return (
        <Container>
            <Tabla
                titulo={props.titulo}
                filas={filasAMostrar}
                columnas={columnasConGrupos}
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
                renderFiltros={() => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel id="filtro-plano-label">Filtrar por Plano</InputLabel>
                            <Select
                                labelId="filtro-plano-label"
                                id="filtro-plano"
                                value={planoSeleccionado}
                                label="Filtrar por Plano"
                                onChange={(e) => setPlanoSeleccionado(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>Todos</em>
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
