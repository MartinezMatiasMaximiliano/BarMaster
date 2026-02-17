import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { formatearMoneda } from '../../utils/formatters';

const GraficaMozos = ({ datosMozos }) => {
    const datosVentas = datosMozos.porVentas.slice(0, 10).map(m => ({
        idMozo: m.idMozo,
        nombreCompleto: m.nombreCompleto || `Mozo ${m.idMozo}`,
        nombre: m.nombre || '',
        apellido: m.apellido || '',
        ventas: m.ventas,
        cantidadVisitas: m.cantidadVisitas,
        promedio: m.promedio
    }));

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
                            <XAxis 
                                dataKey="nombreCompleto" 
                                tick={{ fontSize: 11 }}
                                interval={0}
                            />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip 
                                formatter={(value) => formatearMoneda(value)}
                                labelFormatter={(label) => `Mozo: ${label}`}
                            />
                            <Bar dataKey="ventas" fill="#1976d2" />
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
                            <XAxis 
                                dataKey="nombreCompleto" 
                                tick={{ fontSize: 11 }}
                                interval={0}
                            />
                            <YAxis />
                            <Tooltip 
                                labelFormatter={(label) => `Mozo: ${label}`}
                            />
                            <Bar dataKey="cantidadVisitas" fill="#388e3c" />
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
                                formatter={(value, name) => {
                                    if (name === 'Ventas') return formatearMoneda(value);
                                    return value;
                                }}
                            />
                            <Scatter name="Mozos" data={datosVentas} fill="#7b1fa2" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default GraficaMozos;
