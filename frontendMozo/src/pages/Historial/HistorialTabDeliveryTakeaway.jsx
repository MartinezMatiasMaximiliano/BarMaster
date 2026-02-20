import React, { useState, useEffect, useMemo } from 'react';
import { Box, Alert, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
    { key: 'tipoPago', label: 'Tipo de pago', align: 'left' },
    { key: 'entregado', label: 'Entregado', align: 'center' },
];

const COLUMNAS_KEYS = ['fechaHora', 'nombreCliente', 'direccion', 'telefono', 'indicaciones', 'precioTotal', 'tipoPago', 'entregado'];

/**
 * Convierte un ítem del backend (DeliveriesTakeaways) al formato de fila de la tabla.
 * Cuando exista el endpoint, usar este mapper sobre la respuesta.
 */
export function mapearDeliveryTakeawayARow(item) {
    const fecha = item.fechaHora ?? item.FechaHora ?? '';
    const fechaStr = typeof fecha === 'string' ? fecha.substring(0, 19).replace('T', ' ') : '-';
    const tipoPago = item.tipoPago ?? item.TipoPago ?? item.visita?.pagos?.[0]?.tipoPago?.nombre ?? item.visita?.Pagos?.[0]?.TipoPago?.Nombre ?? '-';
    const tipoPagoStr = typeof tipoPago === 'string' ? tipoPago : (tipoPago?.nombre ?? tipoPago?.Nombre ?? '-');
    return {
        id: item.id ?? item.Id,
        fechaHora: fechaStr,
        nombreCliente: (item.nombreCliente ?? item.NombreCliente ?? '-').toString().trim(),
        direccion: (item.direccion ?? item.Direccion ?? '-').toString().trim(),
        telefono: (item.telefono ?? item.Telefono ?? '-').toString().trim(),
        indicaciones: (item.indicaciones ?? item.Indicaciones ?? '-').toString().trim() || '-',
        precioTotal: Number(item.precioTotal ?? item.PrecioTotal ?? 0).toFixed(2),
        tipoPago: tipoPagoStr || '-',
        entregado: item.entregado ?? item.Entregado ?? false ? 'Sí' : 'No',
    };
}

/**
 * Pestaña de historial para Delivery o Take Away.
 * Por ahora no existe el endpoint en el backend; se muestra la tabla vacía y un aviso.
 */
export default function HistorialTabDeliveryTakeaway({ titulo }) {
    const [filas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [filasFiltradas, setFilasFiltradas] = useState([]);
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);

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
        tipoPago: { tipo: 'text' },
        entregado: { tipo: 'select', opciones: [{ id: 'Sí', nombre: 'Sí' }, { id: 'No', nombre: 'No' }] },
    }), []);

    const opcionesOrden = useMemo(() => [
        { label: 'Fecha y hora', campo: 'fechaHora', tipoOrden: 'texto' },
        { label: 'Cliente', campo: 'nombreCliente', tipoOrden: 'texto' },
        { label: 'Total', campo: 'precioTotal', tipoOrden: 'numero' },
        { label: 'Tipo de pago', campo: 'tipoPago', tipoOrden: 'texto' },
    ], []);

    const mensajeEndpoint = 'El endpoint para obtener este historial aún no está implementado en el backend. La tabla mostrará los registros cuando esté disponible.';

    return (
        <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
                {mensajeEndpoint}
            </Alert>
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
