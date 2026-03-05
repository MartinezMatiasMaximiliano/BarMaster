import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert, TextField, InputAdornment, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ObtenerTodasLasVisitas } from '../../API/APIVisitas';
import { formatearFechaCompleta } from '../../Helpers/HelperFunctions';
import Tabla from '../../components/Tabla/Tabla';
import Ordenar from '../../components/Ordenar/Ordenar';
import Filtros from '../../components/Filtros/Filtros';
import FiltroFechas from '../../components/FiltroFechas/FiltroFechas';
import { filtrarPorBusqueda } from './utils';

const COLUMNAS_KEYS = ['numeroMesa', 'mozo', 'fecha', 'total', 'tipoPago'];

export default function HistorialTabLocal() {
    const [visitas, setVisitas] = useState([]);
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
            const data = await ObtenerTodasLasVisitas();
            setVisitas(Array.isArray(data) ? data : []);
            setDatosCargados(true);
        } catch (err) {
            setError(err?.message || 'Error al cargar el historial local.');
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
        const soloLocal = visitas.filter((v) => (v.origen ?? v.Origen ?? '') === 'Local');
        let filtradas = soloLocal;

        if (filtroFechaInicio) {
            const inicio = new Date(filtroFechaInicio);
            filtradas = filtradas.filter(v => new Date(v.fechaHora ?? v.FechaHora) >= inicio);
        }
        if (filtroFechaFin) {
            const fin = new Date(filtroFechaFin);
            fin.setHours(23, 59, 59, 999);
            filtradas = filtradas.filter(v => new Date(v.fechaHora ?? v.FechaHora) <= fin);
        }

        return filtradas.map((v) => {
            const numeroMesa = v.numeroMesa ?? v.NumeroMesa ?? v.mesa?.numero ?? v.mesa?.Nombre ?? '-';
            const mozo = v.mozo ?? v.Mozo;
            const nombreMozo = mozo ? (mozo.nombres ?? mozo.Nombres ?? '') + ' ' + (mozo.apellido ?? mozo.Apellido ?? '') : '-';
            const fechaRaw = v.fechaHora ?? v.FechaHora ?? '';
            const total = v.productosConsumidos?.reduce((acc, p) => acc + (p.precio ?? p.precioDelMomento ?? p.Precio ?? 0), 0) ?? 0;
            const pagos = v.pagos ?? v.Pagos ?? [];
            const tipoPagoStr = pagos.length > 0
                ? pagos.map((p) => p.tipoPago?.nombre ?? p.TipoPago?.Nombre ?? p.tipoPago?.Nombre ?? (p.idTipoPago != null ? `Tipo ${p.idTipoPago}` : '')).filter(Boolean).join(', ') || '-'
                : '-';
            return {
                id: v.id ?? v.Id,
                numeroMesa: String(numeroMesa).trim() || '-',
                mozo: nombreMozo.trim() || '-',
                fecha: fechaRaw,
                total: Number(total),
                tipoPago: tipoPagoStr,
            };
        });
    }, [visitas, filtroFechaInicio, filtroFechaFin]);

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

    const columnas = [
        { key: 'numeroMesa', label: 'Mesa', align: 'left' },
        { key: 'mozo', label: 'Mozo', align: 'left' },
        { key: 'fecha', label: 'Fecha y hora', align: 'left', render: (f) => (f.fecha ? formatearFechaCompleta(f.fecha) : '-') },
        { key: 'total', label: 'Total', align: 'right', render: (f) => Number(f.total).toFixed(2) },
        { key: 'tipoPago', label: 'Tipo de pago', align: 'left' },
    ];

    const configFiltros = useMemo(() => ({
        numeroMesa: { tipo: 'text' },
        mozo: { tipo: 'text' },
        fecha: { tipo: 'text' },
        total: { tipo: 'number' },
        tipoPago: { tipo: 'text' },
    }), []);

    const opcionesOrden = useMemo(() => [
        { label: 'Mesa', campo: 'numeroMesa', tipoOrden: 'texto' },
        { label: 'Mozo', campo: 'mozo', tipoOrden: 'texto' },
        { label: 'Fecha y hora', campo: 'fecha', tipoOrden: 'fecha' },
        { label: 'Total', campo: 'total', tipoOrden: 'numero' },
        { label: 'Tipo de pago', campo: 'tipoPago', tipoOrden: 'texto' },
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
