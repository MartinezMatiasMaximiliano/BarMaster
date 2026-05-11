import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { esDelivery, esTakeaway, GetDeliveryTakeaway, normalizarDeliveryTakeaway } from '../../API/APIDeliveryTakeaway';
import Tabla from '../../components/Tabla/Tabla';
import Ordenar from '../../components/Ordenar/Ordenar';
import Filtros from '../../components/Filtros/Filtros';
import { estaFechaEnRango, tieneFiltroHistorialActivo } from './utils';

export function mapearDeliveryTakeawayARow(item) {
    const normalizado = normalizarDeliveryTakeaway(item);
    const fecha = normalizado.fechaHora ?? '';
    const fechaStr = typeof fecha === 'string' ? fecha.substring(0, 19).replace('T', ' ') : '-';
    return {
        id: normalizado.id,
        fechaHora: fechaStr,
        fechaHoraRaw: fecha,
        nombreCliente: (normalizado.cliente ?? '-').toString().trim(),
        direccion: (normalizado.direccion ?? '-').toString().trim(),
        telefono: (normalizado.telefono ?? '-').toString().trim(),
        indicaciones: (normalizado.indicaciones ?? '-').toString().trim() || '-',
        precioTotal: normalizado.precioTotal.toFixed(2),
        entregado: normalizado.entregado ? 'Sí' : 'No',
    };
}

/**
 * Pestaña de historial para Delivery o Take Away.
 * @param {string} titulo - Título de la tabla
 * @param {string} tipo - "delivery" o "takeaway"
 */
export default function HistorialTabDeliveryTakeaway({ titulo, tipo, fechaInicio, fechaFin, modoHistorico }) {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);
    const [datosCargados, setDatosCargados] = useState(false);
    const filtroActivo = tieneFiltroHistorialActivo({ fechaInicio, fechaFin, modoHistorico });

    React.useEffect(() => {
        let ignorar = false;

        if (!filtroActivo) {
            setDatos([]);
            setDatosCargados(false);
            setError('');
            setLoading(false);
            return undefined;
        }

        const cargarDatos = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await GetDeliveryTakeaway();
                if (ignorar) return;
                setDatos(Array.isArray(data) ? data : []);
                setDatosCargados(true);
            } catch (err) {
                if (ignorar) return;
                setError(err?.message || 'Error al cargar el historial.');
            } finally {
                if (!ignorar) {
                    setLoading(false);
                }
            }
        };

        cargarDatos();

        return () => {
            ignorar = true;
        };
    }, [filtroActivo, fechaInicio, fechaFin, modoHistorico]);

    const filas = useMemo(() => {
        const filtrados = tipo === 'delivery'
            ? datos.filter(esDelivery)
            : datos.filter(esTakeaway);

        let rows = filtrados.map(mapearDeliveryTakeawayARow);

        if (!modoHistorico) {
            rows = rows.filter((row) =>
                estaFechaEnRango(row.fechaHoraRaw, fechaInicio, fechaFin)
            );
        }

        return rows;
    }, [datos, tipo, fechaInicio, fechaFin, modoHistorico]);

    React.useEffect(() => {
        setFilasFiltradas(filas);
        setFilasOrdenadas(filas);
    }, [filas]);

    React.useEffect(() => {
        setFilasOrdenadas(filasFiltradas);
    }, [filasFiltradas]);

    const opcionesOrden = useMemo(() => [
        { label: 'Fecha y hora', campo: 'fechaHoraRaw', tipoOrden: 'fecha' },
        { label: 'Cliente', campo: 'nombreCliente', tipoOrden: 'texto' },
        { label: 'Total', campo: 'precioTotal', tipoOrden: 'numero' },
    ], []);

    const columnas = useMemo(() => {
        const columnasBase = [
            { key: 'fechaHora', label: 'Fecha y hora', align: 'left' },
            { key: 'nombreCliente', label: 'Cliente', align: 'left' },
            { key: 'telefono', label: 'Teléfono', align: 'left' },
            { key: 'indicaciones', label: 'Indicaciones', align: 'left' },
            { key: 'precioTotal', label: 'Total', align: 'right' },
            { key: 'entregado', label: 'Entregado', align: 'center' },
        ];

        if (tipo === 'delivery') {
            columnasBase.splice(2, 0, { key: 'direccion', label: 'Dirección', align: 'left' });
        }

        return columnasBase;
    }, [tipo]);

    return (
        <Box sx={{ pt: 2 }}>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, py: 4 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {!loading && !error && !filtroActivo && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        Seleccioná un rango de fechas o presioná "Histórico" para ver los datos.
                    </Typography>
                </Box>
            )}
            {!loading && !error && filtroActivo && datosCargados && (
                <>
                    <Tabla
                        titulo={titulo}
                        filas={filasOrdenadas}
                        columnas={columnas}
                        paginacion={true}
                        rowsPerPage={10}
                        mostrarExportacion={true}
                        renderFiltros={() => (
                            <Filtros
                                filas={filas}
                                columnas={[{ key: 'entregado', label: 'Entregado' }]}
                                configuracionFiltros={{
                                    entregado: {
                                        tipo: 'select',
                                        opciones: [{ nombre: 'Sí' }, { nombre: 'No' }],
                                    },
                                }}
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
