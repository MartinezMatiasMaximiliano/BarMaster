import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Alert, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ObtenerTodasLasVisitas } from '../../API/APIVisitas';
import { formatearFechaCompleta } from '../../Helpers/HelperFunctions';
import Tabla from '../../components/Tabla/Tabla';
import Ordenar from '../../components/Ordenar/Ordenar';
import Filtros from '../../components/Filtros/Filtros';
import { filtrarPorBusqueda } from './utils';

const COLUMNAS_KEYS = ['numeroMesa', 'mozo', 'fecha', 'total', 'tipoPago'];

export default function HistorialTabLocal() {
    const [visitas, setVisitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        ObtenerTodasLasVisitas()
            .then((data) => {
                if (!cancelled) setVisitas(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (!cancelled) setError(err?.message || 'Error al cargar el historial local.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const filas = useMemo(() => {
        const soloLocal = visitas.filter((v) => (v.origen ?? v.Origen ?? '') === 'Local');
        return soloLocal.map((v) => {
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
    }, [visitas]);

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
        </Box>
    );
}
