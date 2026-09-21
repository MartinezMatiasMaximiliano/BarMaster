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
                            <Line type="monotone" dataKey="total" stroke="var(--bm-primary-dark)" strokeWidth={2} />
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
                            <Bar dataKey="total" fill="var(--bm-success-dark)" />
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
                            <Bar dataKey="total" fill="var(--bm-warning-dark)" />
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
                            <Area type="monotone" dataKey="total" stroke="var(--bm-secondary-dark)" fill="var(--bm-secondary-dark)" fillOpacity={0.6} />
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
                            <Bar dataKey="total" fill="var(--bm-error-dark)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default GraficaVentas;
