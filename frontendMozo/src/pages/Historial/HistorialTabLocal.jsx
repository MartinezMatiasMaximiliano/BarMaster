import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert, Typography, Button, Stack, Popover, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { ObtenerTodasLasVisitas } from '../../API/APIVisitas';
import { formatearFechaCompleta } from '../../Helpers/HelperFunctions';
import Tabla from '../../components/Tabla/Tabla';
import Ordenar from '../../components/Ordenar/Ordenar';
import { exportarTablaAPDF, exportarTablaAExcel } from '../../utils/exportacionTabla';
import { estaFechaEnRango, tieneFiltroHistorialActivo } from './utils';

export default function HistorialTabLocal({ fechaInicio, fechaFin, modoHistorico }) {
    const [visitas, setVisitas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);
    const [datosCargados, setDatosCargados] = useState(false);
    const [ticketsAnchorEl, setTicketsAnchorEl] = useState(null);
    const [ticketIdsActivos, setTicketIdsActivos] = useState([]);
    const filtroActivo = tieneFiltroHistorialActivo({ fechaInicio, fechaFin, modoHistorico });

    React.useEffect(() => {
        let ignorar = false;

        if (!filtroActivo) {
            setVisitas([]);
            setDatosCargados(false);
            setError('');
            setLoading(false);
            return undefined;
        }

        const cargarDatos = async () => {
            setLoading(true);
            setError('');
            try {
                const visitasData = await ObtenerTodasLasVisitas();
                if (ignorar) return;
                setVisitas(Array.isArray(visitasData) ? visitasData : []);
                setDatosCargados(true);
            } catch (err) {
                if (ignorar) return;
                setError(err?.message || 'Error al cargar el historial local.');
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
        const soloLocal = visitas.filter((v) => (v.origen ?? v.Origen ?? '') === 'Local');
        let filtradas = soloLocal;

        if (!modoHistorico) {
            filtradas = filtradas.filter((v) =>
                estaFechaEnRango(v.fechaHora ?? v.FechaHora, fechaInicio, fechaFin)
            );
        }

        return filtradas.map((v) => {
            const productosConsumidos = v.productosConsumidos ?? v.ProductosConsumidos ?? [];
            const ticketsMap = new Map();

            productosConsumidos.forEach((producto) => {
                const idMovimientoCaja = producto.idMovimientoCaja ?? producto.IdMovimientoCaja;
                if (!idMovimientoCaja) return;

                const ticketId = String(idMovimientoCaja);
                const precio = Number(producto.precio ?? producto.precioDelMomento ?? producto.Precio ?? 0);
                const fechaProducto = producto.fechaAgregado ?? producto.FechaAgregado ?? null;

                if (!ticketsMap.has(ticketId)) {
                    ticketsMap.set(ticketId, {
                        id: ticketId,
                        total: 0,
                        hora: fechaProducto,
                    });
                }

                const ticketActual = ticketsMap.get(ticketId);
                ticketActual.total += precio;

                if (!ticketActual.hora && fechaProducto) {
                    ticketActual.hora = fechaProducto;
                }
            });

            const tickets = Array.from(ticketsMap.values());
            const numeroMesa = v.numeroMesa ?? v.NumeroMesa ?? v.mesa?.numero ?? v.mesa?.Nombre ?? '-';
            const mozo = v.mozo ?? v.Mozo;
            const nombreMozo = mozo ? (mozo.nombres ?? mozo.Nombres ?? '') + ' ' + (mozo.apellido ?? mozo.Apellido ?? '') : '-';
            const fechaRaw = v.fechaHora ?? v.FechaHora ?? '';
            const total = productosConsumidos.reduce((acc, p) => acc + (p.precio ?? p.precioDelMomento ?? p.Precio ?? 0), 0);
            const numeroMesaTexto = String(numeroMesa).trim() || '-';
            const numeroMesaOrden = Number(numeroMesaTexto);

            return {
                id: v.id ?? v.Id,
                numeroMesa: numeroMesaTexto,
                numeroMesaOrden: Number.isFinite(numeroMesaOrden) ? numeroMesaOrden : Number.MAX_SAFE_INTEGER,
                mozo: nombreMozo.trim() || '-',
                fecha: fechaRaw,
                total: Number(total),
                tickets,
            };
        });
    }, [visitas, fechaInicio, fechaFin, modoHistorico]);

    React.useEffect(() => {
        setFilasOrdenadas(filas);
    }, [filas]);

    const tenantId = typeof window !== 'undefined' ? window.localStorage.getItem('tenantId') : '';
    const webBaseUrl = (import.meta.env.WEB_BASE_URL || '').trim().replace(/\/+$/, '');
    const ticketsPopoverOpen = Boolean(ticketsAnchorEl);

    const columnasExportacion = useMemo(() => ([
        { key: 'numeroMesa', label: 'Mesa' },
        { key: 'mozo', label: 'Mozo' },
        {
            key: 'fecha',
            label: 'Fecha y hora',
            formatter: (_, fila) => (fila.fecha ? formatearFechaCompleta(fila.fecha) : '-'),
        },
        {
            key: 'total',
            label: 'Total',
            formatter: (_, fila) => Number(fila.total ?? 0).toFixed(2),
        },
        { key: 'tickets', label: 'Tickets' },
    ]), []);

    const obtenerUrlTicket = (ticketId) => `${webBaseUrl}/ticket/${tenantId}/${ticketId}`;

    const handleExportarPDF = async () => {
        await exportarTablaAPDF({
            datos: filasOrdenadas,
            columnas: columnasExportacion,
            titulo: 'Historial Local',
            subtitulo: `Total de registros: ${filasOrdenadas.length}`,
            infoAdicional: [
                { label: 'Fecha de exportación', value: new Date().toLocaleDateString('es-AR') }
            ],
            formatearFila: (fila) => ([
                { text: fila.numeroMesa ?? '-', fontSize: 9 },
                { text: fila.mozo ?? '-', fontSize: 9 },
                { text: fila.fecha ? formatearFechaCompleta(fila.fecha) : '-', fontSize: 9 },
                { text: Number(fila.total ?? 0).toFixed(2), fontSize: 9 },
                Array.isArray(fila.tickets) && fila.tickets.length > 0
                    ? {
                        text: fila.tickets.flatMap((ticket, index) => {
                            const partes = [];

                            if (index > 0) {
                                partes.push({ text: ', ' });
                            }

                            partes.push({
                                text: `Ticket ${index + 1}`,
                                link: obtenerUrlTicket(ticket.id),
                                color: '#1976d2',
                                decoration: 'underline',
                            });

                            return partes;
                        }),
                        fontSize: 9,
                    }
                    : { text: '-', fontSize: 9 },
            ]),
        });
    };

    const handleExportarExcel = async () => {
        await exportarTablaAExcel({
            datos: filasOrdenadas,
            columnas: columnasExportacion,
            titulo: 'Historial Local',
            subtitulo: `Total de registros: ${filasOrdenadas.length}`,
            infoAdicional: [
                { label: 'Fecha de exportación', value: new Date().toLocaleDateString('es-AR') }
            ],
            formatearFila: (fila) => ([
                fila.numeroMesa ?? '-',
                fila.mozo ?? '-',
                fila.fecha ? formatearFechaCompleta(fila.fecha) : '-',
                Number(fila.total ?? 0).toFixed(2),
                Array.isArray(fila.tickets) && fila.tickets.length > 0
                    ? fila.tickets.map((ticket, index) => `Ticket ${index + 1}: ${obtenerUrlTicket(ticket.id)}`).join('\n')
                    : '-',
            ]),
        });
    };

    const handleAbrirTickets = (event, ticketIds) => {
        setTicketsAnchorEl(event.currentTarget);
        setTicketIdsActivos(ticketIds);
    };

    const handleCerrarTickets = () => {
        setTicketsAnchorEl(null);
        setTicketIdsActivos([]);
    };

    const columnas = [
        { key: 'numeroMesa', label: 'Mesa', align: 'left' },
        { key: 'mozo', label: 'Mozo', align: 'left' },
        { key: 'fecha', label: 'Fecha y hora', align: 'left', render: (f) => (f.fecha ? formatearFechaCompleta(f.fecha) : '-') },
        { key: 'total', label: 'Total', align: 'right', render: (f) => Number(f.total).toFixed(2) },
        {
            key: 'ticketIds',
            label: 'Tickets',
            align: 'left',
            render: (fila) => {
                if (!fila.tickets?.length || !tenantId) {
                    return '-';
                }

                return (
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={(event) => handleAbrirTickets(event, fila.tickets)}
                    >
                        Ver tickets ({fila.tickets.length})
                    </Button>
                );
            },
        },
    ];

    const opcionesOrden = useMemo(() => [
        { label: 'Mesa', campo: 'numeroMesaOrden', tipoOrden: 'numero' },
        { label: 'Mozo', campo: 'mozo', tipoOrden: 'texto' },
        { label: 'Fecha y hora', campo: 'fecha', tipoOrden: 'fecha' },
        { label: 'Total', campo: 'total', tipoOrden: 'numero' },
    ], []);

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
                        titulo=""
                        filas={filasOrdenadas}
                        columnas={columnas}
                        paginacion={true}
                        rowsPerPage={10}
                        mostrarExportacion={true}
                        onExportarPDF={handleExportarPDF}
                        onExportarExcel={handleExportarExcel}
                        renderOrdenar={() => (
                            <Ordenar
                                filas={filas}
                                opcionesOrdenamiento={opcionesOrden}
                                onOrdenar={setFilasOrdenadas}
                            />
                        )}
                    />
                    <Popover
                        open={ticketsPopoverOpen}
                        anchorEl={ticketsAnchorEl}
                        onClose={handleCerrarTickets}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <Box sx={{ minWidth: 240, maxWidth: 320 }}>
                            <List dense disablePadding>
                                {ticketIdsActivos.map((ticket, index) => (
                                    <ListItem key={ticket.id} disablePadding divider={index < ticketIdsActivos.length - 1}>
                                        <ListItemButton
                                            component="a"
                                            href={obtenerUrlTicket(ticket.id)}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={handleCerrarTickets}
                                        >
                                            <ListItemText
                                                primary={`Ticket ${index + 1}`}
                                                secondary={`$ ${Number(ticket.total ?? 0).toFixed(2)}`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Popover>
                </>
            )}
        </Box>
    );
}
