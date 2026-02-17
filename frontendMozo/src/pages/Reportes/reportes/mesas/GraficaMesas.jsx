import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { formatearMoneda } from '../../utils/formatters';

const GraficaMesas = ({ datosMesas }) => {
    const datosIngresos = datosMesas.porIngresos.slice(0, 15).map(m => ({
        nombre: m.nombre,
        ingresos: m.ingresos,
        cantidadVisitas: m.cantidadVisitas
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
        </Box>
    );
};

export default GraficaMesas;
