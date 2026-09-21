import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { BuscarTodasLasReservas, ModificarReserva } from '../../API/APIReservas';
import { formatearFechaCompleta } from '../../Helpers/HelperFunctions';
import Tabla from '../../components/Tabla/Tabla';
import BuscadorTabla from '../../components/Tabla/BuscadorTabla';
import Ordenar from '../../components/Ordenar/Ordenar';
import { estaFechaEnRango, filtrarPorBusqueda, tieneFiltroHistorialActivo } from './utils';
import EstadoReservaChip from '../../components/Reservas/EstadoReservaChip';

export default function HistorialTabReservas({ fechaInicio, fechaFin, modoHistorico }) {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorEstado, setErrorEstado] = useState('');
    const [filasOrdenadas, setFilasOrdenadas] = useState([]);
    const [datosCargados, setDatosCargados] = useState(false);
    const [textoBusqueda, setTextoBusqueda] = useState('');
    const filtroActivo = tieneFiltroHistorialActivo({ fechaInicio, fechaFin, modoHistorico });

    React.useEffect(() => {
        let ignorar = false;

        if (!filtroActivo) {
            setReservas([]);
            setDatosCargados(false);
            setError('');
            setLoading(false);
            return undefined;
        }

        const cargarDatos = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await BuscarTodasLasReservas();
                if (ignorar) return;
                const raw = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
                setReservas(raw);
                setDatosCargados(true);
            } catch (err) {
                if (ignorar) return;
                setError(err?.message || 'Error al cargar el historial de reservas.');
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
        let filtradas = [...reservas];

        if (!modoHistorico) {
            filtradas = filtradas.filter((reserva) =>
                estaFechaEnRango(reserva.fechaHora ?? reserva.FechaHora, fechaInicio, fechaFin)
            );
        }

        const filasMapeadas = filtradas.map((r) => {
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
                mesaReserva: (r.mesaReserva ?? r.MesaReserva) ? `Mesa ${r.mesaReserva ?? r.MesaReserva}` : '',
                estado: nombreEstado,
                IdEstadoReserva: idEstado,
                tipoPago: tipoPagoStr || '-',
            };
        });

        return filtrarPorBusqueda(
            filasMapeadas,
            textoBusqueda,
            ['id', 'fechaHora', 'nombreReserva', 'mesaReserva', 'cantidadDePersonas', 'estado', 'tipoPago']
        );
    }, [reservas, fechaInicio, fechaFin, modoHistorico, textoBusqueda]);

    React.useEffect(() => {
        setFilasOrdenadas(filas);
    }, [filas]);

    const columnas = useMemo(() => [
        { key: 'fechaHora', label: 'Fecha y hora', align: 'left', render: (f) => (f.fechaHora ? formatearFechaCompleta(f.fechaHora) : '-') },
        { key: 'nombreReserva', label: 'Nombre de reserva', align: 'left' },
        { key: 'mesaReserva', label: 'Mesa reservada', render: (fila) => fila.mesaReserva || '' },
        { key: 'cantidadDePersonas', label: 'Personas', align: 'right' },
        { key: 'tipoPago', label: 'Tipo de pago', align: 'left' },
        {
            key: 'estado',
            label: 'Estado',
            align: 'center',
            render: (fila) => (
                <EstadoReservaChip estado={fila.estado} idEstado={fila.IdEstadoReserva} onError={setErrorEstado}
                    onCambiar={async idEstado => {
                        setErrorEstado('');
                        await ModificarReserva({ id: fila.id, IdEstadoReserva: idEstado });
                        setReservas(actuales => actuales.map(reserva => {
                            const id = reserva.id ?? reserva.Id;
                            if (id !== fila.id) return reserva;
                            return { ...reserva, estado: {
                                id: idEstado,
                                nombre: idEstado === 3 ? 'Cancelada' : 'Confirmada',
                            } };
                        }));
                    }} />
            ),
        },
    ], []);

    const opcionesOrden = useMemo(() => [
        { label: 'Fecha y hora', campo: 'fechaHora', tipoOrden: 'fecha' },
        { label: 'Nombre de reserva', campo: 'nombreReserva', tipoOrden: 'texto' },
        { label: 'Mesa reservada', campo: 'mesaReserva', tipoOrden: 'texto' },
        { label: 'Personas', campo: 'cantidadDePersonas', tipoOrden: 'numero' },
        { label: 'Tipo de pago', campo: 'tipoPago', tipoOrden: 'texto' },
        { label: 'Estado', campo: 'estado', tipoOrden: 'texto' },
    ], []);

    return (
        <Box sx={{ pt: 2 }}>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, py: 4 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {errorEstado && <Alert severity="error" onClose={() => setErrorEstado('')} sx={{ mt: 2 }}>{errorEstado}</Alert>}
            {!loading && !error && !filtroActivo && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        {'Seleccioná un rango de fechas o presioná "Histórico" para ver los datos.'}
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
                        rowsPerPage={15}
                        ajustarAlturaAlContenido={true}
                        mostrarExportacion={true}
                        renderBuscar={() => (
                            <BuscadorTabla
                                value={textoBusqueda}
                                onChange={setTextoBusqueda}
                                placeholder="Nombre, mesa, estado, pago..."
                            />
                        )}
                        renderOrdenar={() => (
                            <Ordenar
                                filas={filas}
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
