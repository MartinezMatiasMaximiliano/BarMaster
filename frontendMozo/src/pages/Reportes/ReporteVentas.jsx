import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Typography, CircularProgress, Alert, Box, Card, CardContent, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFiltros } from './hooks/useFiltros';
import { useReportes } from './hooks/useReportes';
import FiltrosAvanzados from './components/FiltrosAvanzados';
import GraficaVentas from './reportes/ventas/GraficaVentas';
import TablaDetallada from './components/TablaDetallada';
import Mapa_Calor from '../../components/Graficas/Mapa_Calor';
import { contarMesas } from '../../components/Graficas/Funciones';
import { filtrarMesasPorPlano } from '../Index2/utils/mesaHelpers';
import { BuscarTodosLosPlanos } from '../../API/APIPlanos';
import { BuscarTodasLasMesas } from '../../API/APIMesas';

const COLS_GRID = 15;
const ROW_HEIGHT_GRID = 50;

function crearLayoutMesas(mesas) {
    if (!Array.isArray(mesas) || mesas.length === 0) return [];
    return mesas.map((m) => ({
        i: String(m.id ?? m.Id),
        x: Number(m.x ?? 0),
        y: Number(m.y ?? 0),
        w: Math.max(1, Number(m.w ?? 1)),
        h: Math.max(1, Number(m.h ?? 1)),
        nombre: m.nombre ?? m.Nombre ?? String(m.id ?? m.Id)
    }));
}

const ReporteVentas = () => {
    const filtros = useFiltros();
    const reportes = useReportes(filtros);

    const handleBuscar = useCallback(() => reportes.cargarVisitas(), [reportes.cargarVisitas]);
    const handleHistorico = useCallback(() => {
        filtros.actualizarFiltro('fechaInicio', '');
        filtros.actualizarFiltro('fechaFin', '');
        reportes.cargarVisitas();
    }, [filtros.actualizarFiltro, reportes.cargarVisitas]);

    const [planos, setPlanos] = useState([]);
    const [planoSeleccionado, setPlanoSeleccionado] = useState('');
    const [mesasConLayout, setMesasConLayout] = useState([]);

    useEffect(() => {
        let cancelado = false;
        Promise.all([BuscarTodosLosPlanos(), BuscarTodasLasMesas()])
            .then(([resPlanos, resMesas]) => {
                if (!cancelado) {
                    setPlanos(Array.isArray(resPlanos) ? resPlanos : []);
                    setMesasConLayout(Array.isArray(resMesas) ? resMesas : []);
                    if (!planoSeleccionado && Array.isArray(resPlanos) && resPlanos.length > 0) {
                        setPlanoSeleccionado(String(resPlanos[0].id ?? resPlanos[0].Id ?? ''));
                    }
                }
            })
            .catch(() => {
                if (!cancelado) {
                    setPlanos([]);
                    setMesasConLayout([]);
                }
            });
        return () => { cancelado = true; };
    }, []);

    const dataParaMapa = useMemo(() => {
        const list = (v) => v.productos ?? v.productosConsumidos ?? [];
        return reportes.visitas.flatMap((v) => {
            const nombreMesa = v.numeroMesa ?? reportes.mesas.find((m) => m.id === v.idMesa)?.nombre ?? String(v.idMesa ?? '');
            return list(v).map((p) => ({
                fecha: v.fechaHora,
                mesa: nombreMesa,
                nombre: p.nombreProducto ?? p.nombre,
                precio: p.precioTotal ?? p.precio
            }));
        });
    }, [reportes.visitas, reportes.mesas]);

    const mesasParaMapa = useMemo(
        () => filtrarMesasPorPlano(mesasConLayout, planoSeleccionado),
        [mesasConLayout, planoSeleccionado]
    );
    const layoutMesas = useMemo(() => crearLayoutMesas(mesasParaMapa), [mesasParaMapa]);

    const visitasPorOrigen = useMemo(() => {
        const conteo = { Local: 0, Takeaway: 0, Delivery: 0 };
        reportes.visitas.forEach((v) => {
            const raw = String(v.origen ?? v.Origen ?? '').trim().toLowerCase();
            if (raw === 'takeaway') conteo.Takeaway++;
            else if (raw === 'delivery') conteo.Delivery++;
            else conteo.Local++;
        });
        return [
            { nombre: 'Local', cantidad: conteo.Local },
            { nombre: 'Takeaway', cantidad: conteo.Takeaway },
            { nombre: 'Delivery', cantidad: conteo.Delivery }
        ];
    }, [reportes.visitas]);

    if (reportes.loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (reportes.error) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {reportes.error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Reporte de Ventas
            </Typography>

            <FiltrosAvanzados
                filtros={filtros.filtros}
                actualizarFiltro={filtros.actualizarFiltro}
                limpiarFiltros={filtros.limpiarFiltros}
                mesas={reportes.mesas}
                categorias={reportes.categorias}
                tipoPagos={reportes.tipoPagos}
                ocultarTipoReporte={true}
                onBuscar={handleBuscar}
                onHistorico={handleHistorico}
            />

            {!reportes.datosCargados ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        Seleccioná un rango de fechas para ver los datos, o presioná "Histórico" para ver todo.
                    </Typography>
                </Box>
            ) : (
            <>
            <GraficaVentas datosVentas={reportes.datosVentas} />

            <Box sx={{ mb: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Tipo de visitas
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={visitasPorOrigen}
                                    dataKey="cantidad"
                                    nameKey="nombre"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ nombre, cantidad }) => (cantidad > 0 ? `${nombre}: ${cantidad}` : null)}
                                >
                                    {visitasPorOrigen.map((_, index) => (
                                        <Cell key={index} fill={['#1976d2', '#388e3c', '#f57c00'][index % 3]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Mapa de calor por mesas
                        </Typography>
                        {planos.length > 0 && (
                            <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
                                <InputLabel id="reporte-ventas-plano-label">Plano</InputLabel>
                                <Select
                                    labelId="reporte-ventas-plano-label"
                                    value={planoSeleccionado}
                                    label="Plano"
                                    onChange={(e) => setPlanoSeleccionado(e.target.value)}
                                >
                                    {planos.map((p) => (
                                        <MenuItem key={p.id ?? p.Id} value={String(p.id ?? p.Id)}>
                                            {p.nombre ?? p.Nombre ?? p.id ?? p.Id}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        {layoutMesas.length === 0 ? (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                {mesasConLayout.length === 0
                                    ? 'No hay mesas configuradas en los planos.'
                                    : 'No hay mesas en el plano seleccionado.'}
                            </Typography>
                        ) : (
                            <Mapa_Calor
                                dataFiltrada={dataParaMapa}
                                layout={layoutMesas}
                                cols={COLS_GRID}
                                rowHeight={ROW_HEIGHT_GRID}
                                contarMesas={contarMesas}
                            />
                        )}
                    </CardContent>
                </Card>
            </Box>

            <TablaDetallada visitas={reportes.visitas} tipoReporte="ventas" />
            </>
            )}
        </Container>
    );
};

export default ReporteVentas;

