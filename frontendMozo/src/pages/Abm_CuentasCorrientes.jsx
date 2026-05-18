import React, { useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import { IconButton, Stack } from "@mui/material";
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import Modal_Movimiento_CuentaCorriente from "../components/Modals/Modal_Movimiento_CuentaCorriente";
import MovimientosCuentaCorrienteDrawer from "../components/CuentasCorrientes/MovimientosCuentaCorrienteDrawer";
import Ordenar from "../components/Ordenar/Ordenar";
import Filtros from "../components/Filtros/Filtros";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import {
    CrearCuentaCorriente,
    EliminarCuentaCorriente,
    ModificarCuentaCorriente,
} from "../API/APICuentasCorrientes";
import { Campos as CamposAgregar } from "../configs/agregar/CuentasCorrientes";
import { Campos as CamposEditar } from "../configs/modificar/CuentasCorrientes";

function Abm_CuentasCorrientes(props) {
    const cuentasCorrientes = useMemo(() => props.datos_cuentas_corrientes || [], [props.datos_cuentas_corrientes]);
    const [filasFiltradas, setFilasFiltradas] = useState(cuentasCorrientes);
    const [filasOrdenadas, setFilasOrdenadas] = useState(cuentasCorrientes);
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
    const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false);
    const [mostrarDrawerMovimientos, setMostrarDrawerMovimientos] = useState(false);

    useEffect(() => {
        setFilasFiltradas(cuentasCorrientes);
        setFilasOrdenadas(cuentasCorrientes);
    }, [cuentasCorrientes]);

    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const api = useMemo(() => ({
        crear: CrearCuentaCorriente,
        modificar: ModificarCuentaCorriente,
        eliminar: EliminarCuentaCorriente,
    }), []);

    const columnas = useMemo(() => [
        { key: "nombre", label: "Nombre" },
        { key: "telefono", label: "Teléfono" },
        { key: "domicilio", label: "Domicilio" },
        {
            key: "balance",
            label: "Balance",
            align: "right",
            render: (fila) => `$${Number(fila.balance ?? 0).toFixed(2)}`,
        },
        {
            key: "descuento",
            label: "Descuento",
            align: "right",
            render: (fila) => `${Number(fila.descuento ?? 0)}%`,
        },
        {
            key: "movimientos",
            label: "Movimientos",
            align: "right",
            formatter: (_, fila) => fila.movimientos?.length ?? 0,
            render: (fila) => (
                <button
                    type="button"
                    onClick={() => {
                        setCuentaSeleccionada(fila);
                        setMostrarDrawerMovimientos(true);
                    }}
                    style={{
                        border: 0,
                        background: 'transparent',
                        color: '#1976d2',
                        cursor: 'pointer',
                        padding: 0,
                        font: 'inherit',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                    title="Ver movimientos"
                >
                    {fila.movimientos?.length ?? 0}
                    <LaunchIcon sx={{ fontSize: 16 }} />
                </button>
            ),
        },
        {
            key: "__acciones",
            label: "Acciones",
            align: "right",
            render: (fila) => (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                    <IconButton
                        color="primary"
                        size="small"
                        onClick={() => {
                            setCuentaSeleccionada(fila);
                            setMostrarModalMovimiento(true);
                        }}
                        title="Agregar movimiento"
                    >
                        <AddCircleOutlinedIcon fontSize="small" />
                    </IconButton>
                    <Fila_Acciones
                        fila={fila}
                        api={api}
                        recargar={props.recargarComponentes}
                        showEditar={true}
                        showToggle={() => false}
                        deleteLabel="cuenta corriente"
                        campos={CamposEditar}
                    />
                </Stack>
            ),
        },
    ], [api, props.recargarComponentes]);

    const opcionesOrdenamiento = useMemo(() => ([
        { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' },
        { label: 'Teléfono', campo: 'telefono', tipoOrden: 'numero' },
        { label: 'Domicilio', campo: 'domicilio', tipoOrden: 'texto' },
        { label: 'Balance', campo: 'balance', tipoOrden: 'numero' },
        { label: 'Descuento', campo: 'descuento', tipoOrden: 'numero' },
    ]), []);

    const configuracionFiltros = useMemo(() => ({
        nombre: { tipo: 'text' },
        telefono: { tipo: 'text' },
        domicilio: { tipo: 'text' },
        balance: { tipo: 'number' },
        descuento: { tipo: 'number' },
    }), []);

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
                        campos={CamposAgregar}
                        nombre="cuenta corriente"
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
                        filas={cuentasCorrientes}
                        columnas={columnas}
                        configuracionFiltros={configuracionFiltros}
                        onFiltrar={setFilasFiltradas}
                        key={cuentasCorrientes.length}
                    />
                )}
            />
            <Modal_Movimiento_CuentaCorriente
                open={mostrarModalMovimiento}
                onClose={() => {
                    setMostrarModalMovimiento(false);
                    setCuentaSeleccionada(null);
                }}
                cuentaCorriente={cuentaSeleccionada}
                onSuccess={props.recargarComponentes}
            />
            <MovimientosCuentaCorrienteDrawer
                open={mostrarDrawerMovimientos}
                cuentaCorriente={cuentaSeleccionada}
                onClose={() => {
                    setMostrarDrawerMovimientos(false);
                    setCuentaSeleccionada(null);
                }}
            />
        </Container>
    );
}

export default Abm_CuentasCorrientes;
