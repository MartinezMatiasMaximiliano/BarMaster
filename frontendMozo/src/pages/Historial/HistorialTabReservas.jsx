import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert, TextField, InputAdornment, Chip, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BuscarTodasLasReservas } from '../../API/APIReservas';
import { formatearFechaCompleta } from '../../Helpers/HelperFunctions';
import Tabla from '../../components/Tabla/Tabla';
import Ordenar from '../../components/Ordenar/Ordenar';
import Filtros from '../../components/Filtros/Filtros';
import FiltroFechas from '../../components/FiltroFechas/FiltroFechas';
import { filtrarPorBusqueda } from './utils';

const COLUMNAS_KEYS = ['fechaHora', 'nombreReserva', 'cantidadDePersonas', 'estado', 'tipoPago'];
const COLORES_ESTADO_RESERVA = { 1: 'warning', 2: 'info', 3: 'error', 4: 'success' };

export default function HistorialTabReservas() {
    const [reservas, setReservas] = useState([]);
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
            const data = await BuscarTodasLasReservas();
            const raw = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
            setReservas(raw);
            setDatosCargados(true);
        } catch (err) {
            setError(err?.message || 'Error al cargar el historial de reservas.');
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
        let filtradas = [...reservas];

        if (filtroFechaInicio) {
            const inicio = new Date(filtroFechaInicio);
            filtradas = filtradas.filter(r => new Date(r.fechaHora ?? r.FechaHora) >= inicio);
        }
        if (filtroFechaFin) {
            const fin = new Date(filtroFechaFin);
            fin.setHours(23, 59, 59, 999);
            filtradas = filtradas.filter(r => new Date(r.fechaHora ?? r.FechaHora) <= fin);
        }

        return filtradas.map((r) => {
            const estadoObj = r.estado ?? r.Estado;
            const idEstado = estadoObj?.id ?? estadoObj?.Id ?? r.IdEstadoReserva ?? r.idEstadoReserva;
            const nombreEstado = estadoObj?.nombre ?? estadoObj?.Nombre ?? r.estado ?? r.Estado ?? '-';
            const fechaHoraRaw = r.fechaHora ?? r.FechaHora ?? '';
            const tipoPagoObj = r.tipoPago ?? r.TipoPago;
            const tipoPagoStr = tipoPagoObj != null
                ? (typeof tipoPagoObj === 'string' ? tipoPagoObj : (tipoPagoObj.nombre ?? tipoPagoObj.Nombre ?? '-'))
                : '-';
            return {
                id: r.id ?? r.Id,
                fechaHora: fechaHoraRaw,
                nombreReserva: (r.nombreReserva ?? r.NombreReserva ?? '-').toString().trim(),
                cantidadDePersonas: r.cantidadDePersonas ?? r.CantidadDePersonas ?? '-',
                estado: nombreEstado,
                IdEstadoReserva: idEstado,
                tipoPago: tipoPagoStr || '-',
            };
        });
    }, [reservas, filtroFechaInicio, filtroFechaFin]);

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

    const columnas = useMemo(() => [
        { key: 'fechaHora', label: 'Fecha y hora', align: 'left', render: (f) => (f.fechaHora ? formatearFechaCompleta(f.fechaHora) : '-') },
        { key: 'nombreReserva', label: 'Nombre de reserva', align: 'left' },
        { key: 'cantidadDePersonas', label: 'Personas', align: 'right' },
        { key: 'tipoPago', label: 'Tipo de pago', align: 'left' },
        {
            key: 'estado',
            label: 'Estado',
            align: 'center',
            render: (fila) => (
                <Chip
                    label={fila.estado}
                    color={COLORES_ESTADO_RESERVA[fila.IdEstadoReserva] || 'default'}
                    size="small"
                />
            ),
        },
    ], []);

    const configFiltros = useMemo(() => ({
        fechaHora: { tipo: 'text' },
        nombreReserva: { tipo: 'text' },
        cantidadDePersonas: { tipo: 'number' },
        tipoPago: { tipo: 'text' },
        estado: { tipo: 'text' },
    }), []);

    const opcionesOrden = useMemo(() => [
        { label: 'Fecha y hora', campo: 'fechaHora', tipoOrden: 'fecha' },
        { label: 'Nombre de reserva', campo: 'nombreReserva', tipoOrden: 'texto' },
        { label: 'Personas', campo: 'cantidadDePersonas', tipoOrden: 'numero' },
        { label: 'Tipo de pago', campo: 'tipoPago', tipoOrden: 'texto' },
        { label: 'Estado', campo: 'estado', tipoOrden: 'texto' },
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
                        titulo=""
                        filas={filasOrdenadas}
                        columnas={columnas}
                        paginacion={true}
                        rowsPerPage={10}
                        mostrarExportacion={true}
                        renderFiltros={() => (
                            <Filtros
                                filas={filasConBusqueda}
                                columnas={columnas}
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
