import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Alert, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { GetDeliveryTakeaway } from '../../API/APIDeliveryTakeaway';
import Tabla from '../../components/Tabla/Tabla';
import Ordenar from '../../components/Ordenar/Ordenar';
import Filtros from '../../components/Filtros/Filtros';
import { filtrarPorBusqueda } from './utils';

const COLUMNAS = [
    { key: 'fechaHora', label: 'Fecha y hora', align: 'left' },
    { key: 'nombreCliente', label: 'Cliente', align: 'left' },
    { key: 'direccion', label: 'Dirección', align: 'left' },
    { key: 'telefono', label: 'Teléfono', align: 'left' },
    { key: 'indicaciones', label: 'Indicaciones', align: 'left' },
    { key: 'precioTotal', label: 'Total', align: 'right' },
    { key: 'entregado', label: 'Entregado', align: 'center' },
];

const COLUMNAS_KEYS = ['fechaHora', 'nombreCliente', 'direccion', 'telefono', 'indicaciones', 'precioTotal', 'entregado'];

export function mapearDeliveryTakeawayARow(item) {
    const fecha = item.fechaHora ?? item.FechaHora ?? '';
    const fechaStr = typeof fecha === 'string' ? fecha.substring(0, 19).replace('T', ' ') : '-';
    return {
        id: item.id ?? item.Id,
        fechaHora: fechaStr,
        nombreCliente: (item.nombreCliente ?? item.NombreCliente ?? '-').toString().trim(),
        direccion: (item.direccion ?? item.Direccion ?? '-').toString().trim(),
        telefono: (item.telefono ?? item.Telefono ?? '-').toString().trim(),
        indicaciones: (item.indicaciones ?? item.Indicaciones ?? '-').toString().trim() || '-',
        precioTotal: Number(item.precioTotal ?? item.PrecioTotal ?? 0).toFixed(2),
        entregado: (item.entregado ?? item.Entregado ?? false) ? 'Sí' : 'No',
    };
}

/**
 * Pestaña de historial para Delivery o Take Away.
 * @param {string} titulo - Título de la tabla
 * @param {string} tipo - "delivery" o "takeaway"
 */
export default function HistorialTabDeliveryTakeaway({ titulo, tipo }) {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        GetDeliveryTakeaway()
            .then((data) => {
                if (!cancelled) setDatos(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (!cancelled) setError(err?.message || 'Error al cargar el historial.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const filas = useMemo(() => {
        const filtrados = tipo === 'delivery'
            ? datos.filter(item => (item.idTipoEnvio ?? item.IdTipoEnvio) != null)
            : datos.filter(item => (item.idTipoEnvio ?? item.IdTipoEnvio) == null);
        return filtrados.map(mapearDeliveryTakeawayARow);
    }, [datos, tipo]);

    const filasConBusqueda = useMemo(
        () => filtrarPorBusqueda(filas, busqueda, COLUMNAS_KEYS),
        [filas, busqueda]
    );

    useEffect(() => {
        setFilasFiltradas(filasConBusqueda);
    }, [filasConBusqueda]);

    useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const configFiltros = useMemo(() => ({
        fechaHora: { tipo: 'text' },
        nombreCliente: { tipo: 'text' },
        direccion: { tipo: 'text' },
        telefono: { tipo: 'text' },
        indicaciones: { tipo: 'text' },
        precioTotal: { tipo: 'number' },
        entregado: { tipo: 'select', opciones: [{ id: 'Sí', nombre: 'Sí' }, { id: 'No', nombre: 'No' }] },
    }), []);

    const opcionesOrden = useMemo(() => [
        { label: 'Fecha y hora', campo: 'fechaHora', tipoOrden: 'texto' },
        { label: 'Cliente', campo: 'nombreCliente', tipoOrden: 'texto' },
        { label: 'Total', campo: 'precioTotal', tipoOrden: 'numero' },
    ], []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }
    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    return (
        <Box sx={{ pt: 2 }}>
            <Box sx={{ mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar en todas las columnas..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 260 }}
                />
            </Box>
            <Tabla
                titulo={titulo}
                filas={filasOrdenadas}
                columnas={COLUMNAS}
                paginacion={true}
                rowsPerPage={10}
                mostrarExportacion={true}
                renderFiltros={() => (
                    <Filtros
                        filas={filasConBusqueda}
                        columnas={COLUMNAS}
                        configuracionFiltros={configFiltros}
                        onFiltrar={setFilasFiltradas}
                    />
                )}
                renderOrdenar={() => (
                    <Ordenar
                        filas={filasFiltradas}
                        opcionesOrdenamiento={opcionesOrden}
                        onOrdenar={setFilasOrdenadas}
                    />
                )}
            />
        </Box>
    );
}
