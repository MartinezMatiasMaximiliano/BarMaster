import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from 'recharts';
import { formatearMoneda, formatearPorcentaje } from '../../utils/formatters';
import { boxEmptyMessage } from '../../../../styles/boxStyles';
import { StyledTableCell, StyledTableRow } from '../../../../components/Tabla/Tabla.styles';

const TOP_BARRAS = 15;

const GraficaMesas = ({ datosMesas }) => {
    const porIngresos = datosMesas?.porIngresos ?? [];
    const totalGeneral = datosMesas?.totalGeneral ?? 0;

    if (!porIngresos.length) {
        return (
            <Box sx={{ mb: 4 }}>
                <Card>
                    <CardContent sx={boxEmptyMessage}>
                        <Typography color="text.secondary">
                            No hay datos de mesas en el período seleccionado. Ajustá las fechas o filtros.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const datosIngresos = porIngresos.slice(0, TOP_BARRAS).map(m => ({
        nombre: m.nombre,
        ingresos: m.ingresos,
        cantidadVisitas: m.cantidadVisitas,
        promedioPorVisita: m.promedioPorVisita ?? 0
    }));

    const datosPromedio = [...datosIngresos]
        .sort((a, b) => (b.promedioPorVisita ?? 0) - (a.promedioPorVisita ?? 0))
        .slice(0, TOP_BARRAS);

    const datosParticipacion = porIngresos.map(m => ({
        nombre: m.nombre,
        pctParticipacion: totalGeneral > 0 ? ((m.ingresos ?? 0) / totalGeneral) * 100 : 0,
        ingresos: m.ingresos
    }));

    return (
        <Box sx={{ mb: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ingresos por Mesa
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datosIngresos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip formatter={(value) => formatearMoneda(value)} />
                            <Bar dataKey="ingresos" fill="#1976d2" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ocupación por Mesa (Cantidad de Visitas)
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datosIngresos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="cantidadVisitas" fill="#388e3c" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Participación en ingresos por mesa
                    </Typography>
                    <ResponsiveContainer width="100%" height={Math.max(400, datosParticipacion.length * 28)}>
                        <BarChart
                            data={datosParticipacion}
                            layout="vertical"
                            margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(v) => formatearPorcentaje(v)} domain={[0, 100]} />
                            <YAxis type="category" dataKey="nombre" width={75} tick={{ fontSize: 12 }} />
                            <Tooltip
                                formatter={(value, name, props) => [
                                    formatearPorcentaje(value),
                                    '% participación'
                                ]}
                                content={({ active, payload }) => {
                                    if (!active || !payload?.[0]) return null;
                                    const d = payload[0].payload;
                                    return (
                                        <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                            <Typography variant="body2"><strong>{d.nombre}</strong></Typography>
                                            <Typography variant="body2">% participación: {formatearPorcentaje(d.pctParticipacion)}</Typography>
                                            <Typography variant="body2">Ingresos: {formatearMoneda(d.ingresos ?? 0)}</Typography>
                                        </Box>
                                    );
                                }}
                            />
                            <Bar dataKey="pctParticipacion" fill="#0288d1" name="% participación" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ticket promedio por mesa
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datosPromedio} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip formatter={(value) => formatearMoneda(value)} />
                            <Bar dataKey="promedioPorVisita" fill="#7b1fa2" name="Promedio por visita" />
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
                                    <StyledTableCell>Mesa</StyledTableCell>
                                    <StyledTableCell align="right">Ingresos</StyledTableCell>
                                    <StyledTableCell align="right">Cantidad de visitas</StyledTableCell>
                                    <StyledTableCell align="right">Promedio por visita</StyledTableCell>
                                    <StyledTableCell align="right">% participación</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {porIngresos.map((m) => (
                                    <StyledTableRow key={m.idMesa}>
                                        <StyledTableCell>{m.nombre}</StyledTableCell>
                                        <StyledTableCell align="right">{formatearMoneda(m.ingresos ?? 0)}</StyledTableCell>
                                        <StyledTableCell align="right">{m.cantidadVisitas ?? 0}</StyledTableCell>
                                        <StyledTableCell align="right">{formatearMoneda(m.promedioPorVisita ?? 0)}</StyledTableCell>
                                        <StyledTableCell align="right">
                                            {totalGeneral > 0 ? formatearPorcentaje(((m.ingresos ?? 0) / totalGeneral) * 100) : '-'}
                                        </StyledTableCell>
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

export default GraficaMesas;
