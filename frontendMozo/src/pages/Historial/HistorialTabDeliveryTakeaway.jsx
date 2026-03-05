import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert, TextField, InputAdornment, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { GetDeliveryTakeaway } from '../../API/APIDeliveryTakeaway';
import Tabla from '../../components/Tabla/Tabla';
import Ordenar from '../../components/Ordenar/Ordenar';
import Filtros from '../../components/Filtros/Filtros';
import FiltroFechas from '../../components/FiltroFechas/FiltroFechas';
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
        fechaHoraRaw: fecha,
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);
    const [datosCargados, setDatosCargados] = useState(false);
    const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
    const [filtroFechaFin, setFiltroFechaFin] = useState('');

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await GetDeliveryTakeaway();
            setDatos(Array.isArray(data) ? data : []);
            setDatosCargados(true);
        } catch (err) {
            setError(err?.message || 'Error al cargar el historial.');
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = async (fechaInicio, fechaFin) => {
        setFiltroFechaInicio(fechaInicio);
        setFiltroFechaFin(fechaFin);
        await cargarDatos();
    };

    const handleHistorico = async () => {
        setFiltroFechaInicio('');
        setFiltroFechaFin('');
        await cargarDatos();
    };

    const filas = useMemo(() => {
        const filtrados = tipo === 'delivery'
            ? datos.filter(item => (item.idTipoEnvio ?? item.IdTipoEnvio) != null)
            : datos.filter(item => (item.idTipoEnvio ?? item.IdTipoEnvio) == null);

        let rows = filtrados.map(mapearDeliveryTakeawayARow);

        if (filtroFechaInicio) {
            const inicio = new Date(filtroFechaInicio);
            rows = rows.filter(r => new Date(r.fechaHoraRaw) >= inicio);
        }
        if (filtroFechaFin) {
            const fin = new Date(filtroFechaFin);
            fin.setHours(23, 59, 59, 999);
            rows = rows.filter(r => new Date(r.fechaHoraRaw) <= fin);
        }

        return rows;
    }, [datos, tipo, filtroFechaInicio, filtroFechaFin]);

    const filasConBusqueda = useMemo(
        () => filtrarPorBusqueda(filas, busqueda, COLUMNAS_KEYS),
        [filas, busqueda]
    );

    React.useEffect(() => {
        setFilasFiltradas(filasConBusqueda);
    }, [filasConBusqueda]);

    React.useEffect(() => {
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

    return (
        <Box sx={{ pt: 2 }}>
            <FiltroFechas
                onBuscar={handleBuscar}
                onHistorico={handleHistorico}
                loading={loading}
            />
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, py: 4 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {!loading && !error && !datosCargados && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        Seleccioná un rango de fechas o presioná "Histórico" para ver los datos.
                    </Typography>
                </Box>
            )}
            {!loading && !error && datosCargados && (
                <>
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
                </>
            )}
        </Box>
    );
}
