import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { formatearMoneda } from '../../utils/formatters';

const GraficaVentas = ({ datosVentas }) => {
    return (
        <Box sx={{ mb: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ventas por Fecha
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={datosVentas.porFecha}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip formatter={(value) => formatearMoneda(value)} />
                            <Line type="monotone" dataKey="total" stroke="#1976d2" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ventas por Hora del Día
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={datosVentas.porHora}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hora" />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip formatter={(value) => formatearMoneda(value)} />
                            <Bar dataKey="total" fill="#388e3c" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ventas por Día de la Semana
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={datosVentas.porDiaSemana}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dia" />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip formatter={(value) => formatearMoneda(value)} />
                            <Bar dataKey="total" fill="#f57c00" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ventas Acumuladas
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={datosVentas.acumuladas}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip formatter={(value) => formatearMoneda(value)} />
                            <Area type="monotone" dataKey="total" stroke="#7b1fa2" fill="#7b1fa2" fillOpacity={0.6} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ventas por Tipo de Pago
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={datosVentas.porTipoPago}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis tickFormatter={(value) => formatearMoneda(value)} />
                            <Tooltip formatter={(value) => formatearMoneda(value)} />
                            <Bar dataKey="total" fill="#c62828" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default GraficaVentas;
