import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart';
import { formatearMoneda } from '../utils/formatters';


const GraficaProductos = ({ datosProductos }) => {
    // Preparar datos para gráfico de barras horizontales
    const topProductos = datosProductos.masVendidos.slice(0, 10).map(p => ({
        nombre: p.nombre,
        cantidad: p.cantidad,
        ingresos: p.ingresos
    }));

    // Preparar datos para gráfico de torta por categoría
    const datosPorCategoria = datosProductos.porCategoria.map((c, index) => ({
        id: index,
        value: c.ingresos,
        label: c.nombre
    }));

    return (
        <Box sx={{ mb: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Top 10 Productos Más Vendidos
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            layout="vertical"
                            data={topProductos}
                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => formatearMoneda(value)} />
                            <YAxis dataKey="nombre" type="category" width={80} />
                            <Tooltip formatter={(value) => formatearMoneda(value)} />
                            <Bar dataKey="ingresos" fill="#1976d2" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ingresos por Categoría
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <MuiPieChart
                            series={[
                                {
                                    data: datosPorCategoria,
                                    outerRadius: 120
                                }
                            ]}
                            height={300}
                        />
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Productos Más Rentables
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={datosProductos.masRentables.slice(0, 10)}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip formatter={(value) => formatearMoneda(value)} />
                            <Bar dataKey="margen" fill="#388e3c" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default GraficaProductos;

