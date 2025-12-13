import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Box, Typography } from '@mui/material';

/**
 * Gráfico de barras pequeño para mostrar ingresos por día de la semana
 * @param {Array} data - Datos con formato [{ name: string, value: number }]
 * @param {number} height - Altura del gráfico (default: 120)
 */
const Grafica_Mini_Barras = ({ data, height = 120, color = '#667eea' }) => {
    if (!data || data.length === 0) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    Sin datos
                </Typography>
            </Box>
        );
    }

    // Asegurar que los datos tengan el formato correcto
    const datosFormateados = data.map((item, index) => ({
        name: item.name || item.label || `Día ${index + 1}`,
        value: item.value || item.total || 0
    }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={datosFormateados} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis 
                    hide
                    tick={false}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        fontSize: '12px'
                    }}
                    formatter={(value) => [`$${value.toLocaleString('es-AR')}`, 'Ingresos']}
                />
                <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                >
                    {datosFormateados.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default Grafica_Mini_Barras;

