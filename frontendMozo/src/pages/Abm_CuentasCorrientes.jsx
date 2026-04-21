import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { IconButton, Stack } from "@mui/material";
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import Tabla from "../components/Tabla/Tabla";
import Fila_Acciones from "../components/Tabla/Fila_Acciones";
import Modal_Agregar from "../components/Modals/Agregar_ABM/Modal_Agregar";
import Modal_Movimiento_CuentaCorriente from "../components/Modals/Modal_Movimiento_CuentaCorriente";
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
    const [filasFiltradas, setFilasFiltradas] = useState(props.datos_cuentas_corrientes || []);
    const [filasOrdenadas, setFilasOrdenadas] = useState(props.datos_cuentas_corrientes || []);
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
    const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false);

    useEffect(() => {
        setFilasFiltradas(props.datos_cuentas_corrientes || []);
        setFilasOrdenadas(props.datos_cuentas_corrientes || []);
    }, [props.datos_cuentas_corrientes]);

    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const api = {
        crear: CrearCuentaCorriente,
        modificar: ModificarCuentaCorriente,
        eliminar: EliminarCuentaCorriente,
    };

    const columnas = [
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
            render: (fila) => fila.movimientos?.length ?? 0,
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
                        campos={CamposAgregar}
                        nombre="cuenta corriente"
                    >
                        <FontAwesomeIcon icon={faSquarePlus} />
                    </Modal_Agregar>
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={[
                            { label: 'Nombre', campo: 'nombre', tipoOrden: 'texto' },
                            { label: 'Teléfono', campo: 'telefono', tipoOrden: 'texto' },
                            { label: 'Domicilio', campo: 'domicilio', tipoOrden: 'texto' },
                            { label: 'Balance', campo: 'balance', tipoOrden: 'numero' },
                            { label: 'Descuento', campo: 'descuento', tipoOrden: 'numero' },
                        ]}
                        onOrdenar={setFilasOrdenadas}
                        key={filasFiltradas.length}
                    />
                )}
                renderFiltros={() => (
                    <Filtros
                        filas={props.datos_cuentas_corrientes || []}
                        columnas={columnas}
                        configuracionFiltros={{
                            nombre: { tipo: 'text' },
                            telefono: { tipo: 'text' },
                            domicilio: { tipo: 'text' },
                            balance: { tipo: 'number' },
                            descuento: { tipo: 'number' },
                        }}
                        onFiltrar={setFilasFiltradas}
                        key={props.datos_cuentas_corrientes?.length}
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
        </Container>
    );
}

export default Abm_CuentasCorrientes;
