import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { formatearFechaCorta, formatearMoneda } from '../utils/formatters';

const chartMoney = (value) => formatearMoneda(value).replace(/\s/g, ' ');

const ChartFrame = ({ title, children }) => (
    <Box sx={{ minHeight: 260, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            {title}
        </Typography>
        <Box sx={{ width: '100%', height: 230 }}>
            {children}
        </Box>
    </Box>
);

const SucursalCharts = ({ series = {} }) => {
    const ventasPorHora = series.ventasPorHoraHoy ?? [];
    const ventasPorDia = (series.ventasPorDia ?? []).map(item => ({
        ...item,
        fechaLabel: formatearFechaCorta(item.fecha)
    }));

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: 2,
                mb: 2
            }}
        >
            <ChartFrame title="Ventas por hora de hoy">
                <ResponsiveContainer>
                    <BarChart data={ventasPorHora} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hora" tick={{ fontSize: 11 }} interval={3} />
                        <YAxis tickFormatter={chartMoney} width={72} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => [formatearMoneda(value), 'Ventas']} />
                        <Bar dataKey="total" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartFrame>

            <ChartFrame title="Ventas y margen del período">
                <ResponsiveContainer>
                    <LineChart data={ventasPorDia} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="fechaLabel" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={chartMoney} width={72} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value, name) => [formatearMoneda(value), name === 'ventas' ? 'Ventas' : 'Margen']} />
                        <Line type="monotone" dataKey="ventas" stroke="#1976d2" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="margen" stroke="#2e7d32" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartFrame>
        </Box>
    );
};

export default SucursalCharts;
