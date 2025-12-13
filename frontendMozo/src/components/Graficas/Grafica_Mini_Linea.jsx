import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

/**
 * Gráfico de línea pequeño para mostrar evolución de ingresos
 * @param {Array} data - Datos con formato [{ fecha: string, total: number }]
 * @param {number} height - Altura del gráfico (default: 120)
 */
const Grafica_Mini_Linea = ({ data, height = 120, color = '#667eea' }) => {
    if (!data || data.length === 0) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    Sin datos
                </Typography>
            </Box>
        );
    }

    // Formatear datos para el gráfico
    const datosFormateados = data.map((item, index) => ({
        name: item.fecha ? new Date(item.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : `Día ${index + 1}`,
        value: item.total || item.value || 0
    }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={datosFormateados} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                    <linearGradient id={`color${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
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
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={color} 
                    strokeWidth={2}
                    fill={`url(#color${color.replace('#', '')})`}
                    dot={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default Grafica_Mini_Linea;

