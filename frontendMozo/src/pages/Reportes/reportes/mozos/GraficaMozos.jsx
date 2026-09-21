import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    ZAxis,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend,
    ReferenceLine
} from 'recharts';
import { formatearMoneda, formatearPorcentaje } from '../../utils/formatters';
import { boxEmptyMessage } from '../../../../styles/boxStyles';
import { StyledTableCell, StyledTableRow } from '../../../../components/Tabla/Tabla.styles';

const PALETA = [
    'var(--bm-primary-dark)',
    'var(--bm-success-dark)',
    'var(--bm-warning-dark)',
    'var(--bm-secondary-dark)',
    'var(--bm-primary)',
    'var(--bm-secondary)',
    'var(--bm-success)',
    'var(--bm-error-dark)',
    'var(--bm-error)',
    'var(--bm-grey-03)'
];

const GraficaMozos = ({ datosMozos }) => {
    const lista = datosMozos?.porVentas ?? [];
    const datosVentas = lista.slice(0, 10).map(m => ({
        idMozo: m.idMozo,
        nombreCompleto: m.nombreCompleto || `Mozo ${m.idMozo}`,
        nombre: m.nombre || '',
        apellido: m.apellido || '',
        ventas: m.ventas,
        cantidadVisitas: m.cantidadVisitas,
        promedio: m.promedio,
        promedioProductosPorVisita: m.promedioProductosPorVisita ?? 0,
        margenGanancia: m.margenGanancia ?? 0,
        pctParticipacionVentas: m.pctParticipacionVentas ?? 0,
        pctVsPromedioLocal: m.pctVsPromedioLocal ?? 0
    }));

    const porPeriodo = datosMozos?.porPeriodo ?? [];
    const nombresMozosLineas = datosVentas.map(m => m.nombreCompleto);

    if (datosVentas.length === 0) {
        return (
            <Box sx={{ mb: 4 }}>
                <Card>
                    <CardContent sx={boxEmptyMessage}>
                        <Typography color="text.secondary">
                            No hay datos de mozos en el período seleccionado. Ajustá las fechas o filtros.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const datosPie = datosVentas.map(m => ({ name: m.nombreCompleto, value: m.ventas }));

    return (
        <Box sx={{ mb: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ventas por Mozo
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datosVentas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombreCompleto" tick={{ fontSize: 11 }} interval={0} />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip formatter={(value) => formatearMoneda(value)} labelFormatter={(label) => `Mozo: ${label}`} />
                            <Bar dataKey="ventas" fill="var(--bm-primary-dark)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Cantidad de Visitas por Mozo
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datosVentas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombreCompleto" tick={{ fontSize: 11 }} interval={0} />
                            <YAxis />
                            <Tooltip labelFormatter={(label) => `Mozo: ${label}`} formatter={(value) => [`${value}`, 'Cantidad de visitas']} />
                            <Bar dataKey="cantidadVisitas" name="Cantidad de visitas" fill="var(--bm-success-dark)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Rendimiento: Ventas vs Cantidad de Visitas
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <ScatterChart data={datosVentas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="cantidadVisitas"
                                name="Cantidad Visitas"
                                label={{ value: 'Cantidad de Visitas', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="ventas"
                                name="Ventas"
                                tickFormatter={(value) => formatearMoneda(value)}
                                label={{ value: 'Ventas', angle: -90, position: 'insideLeft' }}
                            />
                            <ZAxis type="number" dataKey="promedio" range={[50, 400]} />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ payload }) => {
                                    if (!payload?.length) return null;
                                    const p = payload[0]?.payload;
                                    return (
                                        <Box component="div" sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, minWidth: 180 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{p?.nombreCompleto ?? 'Mozo'}</Typography>
                                            <Typography variant="body2">Cantidad de visitas: {p?.cantidadVisitas ?? 0}</Typography>
                                            <Typography variant="body2">Ventas: {formatearMoneda(p?.ventas ?? 0)}</Typography>
                                        </Box>
                                    );
                                }}
                            />
                            <Scatter name="Mozos" data={datosVentas} fill="var(--bm-secondary-dark)" label={{ dataKey: 'nombreCompleto', position: 'bottom', fontSize: 11 }} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Promedio por visita por mozo
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datosVentas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombreCompleto" tick={{ fontSize: 11 }} interval={0} />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip
                                formatter={(value) => [formatearMoneda(value), 'Promedio por visita']}
                                labelFormatter={(label) => `Mozo: ${label}`}
                            />
                            <Bar dataKey="promedio" name="Promedio por visita" fill="var(--bm-warning-dark)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Comparativa vs promedio del local en ventas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Del 100%, ¿qué tanto participa cada mozo?
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datosVentas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombreCompleto" tick={{ fontSize: 11 }} interval={0} />
                            <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 'auto']} />
                            <Tooltip
                                formatter={(value) => [formatearPorcentaje(value), 'Porcentaje del promedio del local']}
                                labelFormatter={(label) => `Mozo: ${label}`}
                            />
                            <ReferenceLine y={100} stroke="var(--bm-grey-03)" strokeDasharray="3 3" />
                            <Bar dataKey="pctVsPromedioLocal" name="Porcentaje del promedio del local" fill="var(--bm-secondary)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Promedio de productos por visita
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datosVentas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombreCompleto" tick={{ fontSize: 11 }} interval={0} />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => [value, 'Promedio de productos por visita']}
                                labelFormatter={(label) => `Mozo: ${label}`}
                            />
                            <Bar dataKey="promedioProductosPorVisita" name="Promedio de productos por visita" fill="var(--bm-success)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {porPeriodo.length > 0 && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Evolución en el tiempo
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={porPeriodo} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="periodoLabel" tick={{ fontSize: 11 }} />
                                <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                                <Tooltip formatter={(value) => formatearMoneda(value)} />
                                <Legend />
                                {nombresMozosLineas.map((nombre, i) => (
                                    <Line
                                        key={nombre}
                                        type="monotone"
                                        dataKey={nombre}
                                        stroke={PALETA[i % PALETA.length]}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Participación en ventas totales
                    </Typography>
                    <ResponsiveContainer width="100%" height={380}>
                        <PieChart>
                            <Pie
                                data={datosPie}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ name, percent }) => (percent > 0.02 ? `${name}: ${(percent * 100).toFixed(1)}%` : null)}
                            >
                                {datosPie.map((_, index) => (
                                    <Cell key={index} fill={PALETA[index % PALETA.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatearMoneda(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Margen de ganancia por mozo
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datosVentas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombreCompleto" tick={{ fontSize: 11 }} interval={0} />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip
                                formatter={(value) => [formatearMoneda(value), 'Margen de ganancia']}
                                labelFormatter={(label) => `Mozo: ${label}`}
                            />
                            <Bar dataKey="margenGanancia" name="Margen de ganancia" fill="var(--bm-error-dark)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Tabla resumen
                    </Typography>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Mozo</StyledTableCell>
                                    <StyledTableCell align="right">Ventas</StyledTableCell>
                                    <StyledTableCell align="right">Visitas</StyledTableCell>
                                    <StyledTableCell align="right">Promedio por visita</StyledTableCell>
                                    <StyledTableCell align="right">Productos/visita (prom.)</StyledTableCell>
                                    <StyledTableCell align="right">% participación</StyledTableCell>
                                    <StyledTableCell align="right">% vs promedio local</StyledTableCell>
                                    <StyledTableCell align="right">Margen</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(datosMozos?.porVentas ?? []).map((m) => (
                                    <StyledTableRow key={m.idMozo}>
                                        <StyledTableCell>{m.nombreCompleto || `Mozo ${m.idMozo}`}</StyledTableCell>
                                        <StyledTableCell align="right">{formatearMoneda(m.ventas ?? 0)}</StyledTableCell>
                                        <StyledTableCell align="right">{m.cantidadVisitas ?? 0}</StyledTableCell>
                                        <StyledTableCell align="right">{formatearMoneda(m.promedio ?? 0)}</StyledTableCell>
                                        <StyledTableCell align="right">{(m.promedioProductosPorVisita ?? 0).toFixed(1)}</StyledTableCell>
                                        <StyledTableCell align="right">{formatearPorcentaje(m.pctParticipacionVentas ?? 0)}</StyledTableCell>
                                        <StyledTableCell align="right">{formatearPorcentaje(m.pctVsPromedioLocal ?? 0)}</StyledTableCell>
                                        <StyledTableCell align="right">{formatearMoneda(m.margenGanancia ?? 0)}</StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default GraficaMozos;
