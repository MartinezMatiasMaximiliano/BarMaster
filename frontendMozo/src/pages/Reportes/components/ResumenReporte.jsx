import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, Tooltip } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import PercentIcon from '@mui/icons-material/Percent';
import InventoryIcon from '@mui/icons-material/Inventory';
import { formatearMoneda, formatearPorcentaje } from '../utils/formatters';

const ResumenReporte = ({ metricas, visitas = [], mesas = [], productos = [] }) => {
    // Calcular métricas adicionales
    const metricasAdicionales = useMemo(() => {
        const totalPagos = visitas.reduce((sum, v) => sum + (v.pagos?.length || 0), 0);
        const promedioProductosPorVisita = metricas.cantidadVisitas > 0 
            ? (metricas.productosVendidos / metricas.cantidadVisitas).toFixed(1)
            : 0;
        
        const mesasOcupadas = new Set(visitas.map(v => v.idMesa)).size;
        const mozosActivos = new Set(
            visitas
                .filter(v => v.mozo?.id)
                .map(v => v.mozo.id)
        ).size;
        
        const margenPorcentual = metricas.totalVentas > 0
            ? ((metricas.margenGanancia / metricas.totalVentas) * 100)
            : 0;
        
        const totalCostos = metricas.totalVentas - metricas.margenGanancia;
        
        return {
            totalPagos,
            promedioProductosPorVisita,
            mesasOcupadas,
            mozosActivos,
            margenPorcentual,
            totalCostos
        };
    }, [visitas, mesas, metricas]);

    const cards = [
        {
            titulo: 'Total de Ventas',
            valor: formatearMoneda(metricas.totalVentas || 0),
            icono: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
            color: '#1976d2',
            explicacion: 'Es todo el dinero que entró por ventas en el período que elegiste.'
        },
        {
            titulo: 'Cantidad de Visitas',
            valor: metricas.cantidadVisitas || 0,
            icono: <ReceiptIcon sx={{ fontSize: 40 }} />,
            color: '#388e3c',
            explicacion: 'Cuántas veces hubo un consumo o venta en el período (cada mesa atendida, delivery o takeaway, cuenta).'
        },
        {
            titulo: 'Promedio por Visita',
            valor: formatearMoneda(metricas.promedioPorVisita || 0),
            icono: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            color: '#f57c00',
            explicacion: 'Cuánto se vendió en promedio en cada visita: el total de ventas repartido entre la cantidad de visitas.'
        },
        {
            titulo: 'Productos Vendidos',
            valor: metricas.productosVendidos || 0,
            icono: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
            color: '#7b1fa2',
            explicacion: 'Cuántas unidades de productos se vendieron en total en el período (cada bebida, plato o producto cuenta).'
        },
        {
            titulo: 'Margen de Ganancia',
            valor: formatearMoneda(metricas.margenGanancia || 0),
            icono: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            color: '#c62828',
            explicacion: 'La ganancia neta: lo que pagó el cliente menos lo que te costó a vos el producto, sumado para todas las ventas.'
        },
        {
            titulo: 'Total de Pagos',
            valor: metricasAdicionales.totalPagos || 0,
            icono: <PaymentIcon sx={{ fontSize: 40 }} />,
            color: '#0288d1',
            explicacion: 'Cuántas veces se cobró: si en una mesa pagaron con efectivo y tarjeta, son 2 pagos; cada forma de pago cuenta por separado.'
        },
        {
            titulo: 'Promedio Productos/Visita',
            valor: metricasAdicionales.promedioProductosPorVisita || 0,
            icono: <InventoryIcon sx={{ fontSize: 40 }} />,
            color: '#5c6bc0',
            explicacion: 'Cuántos productos se llevaron en promedio en cada visita (por ejemplo: 4 productos por mesa).'
        },
        {
            titulo: 'Mesas Ocupadas',
            valor: metricasAdicionales.mesasOcupadas || 0,
            icono: <TableRestaurantIcon sx={{ fontSize: 40 }} />,
            color: '#00897b',
            explicacion: 'Cuántas mesas distintas tuvieron al menos un consumo en el período; cada mesa se cuenta una sola vez.'
        },
        {
            titulo: 'Mozos Activos',
            valor: metricasAdicionales.mozosActivos || 0,
            icono: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: '#7b1fa2',
            explicacion: 'Cuántos mozos distintos atendieron al menos una mesa en el período; cada persona se cuenta una sola vez.'
        },
        {
            titulo: 'Margen Porcentual',
            valor: formatearPorcentaje(metricasAdicionales.margenPorcentual || 0),
            icono: <PercentIcon sx={{ fontSize: 40 }} />,
            color: '#c62828',
            explicacion: 'Qué parte de lo que vendiste es ganancia: el porcentaje que te quedás después de restar los costos de lo vendido.'
        },
        {
            titulo: 'Total de Costos',
            valor: formatearMoneda(metricasAdicionales.totalCostos || 0),
            icono: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
            color: '#d32f2f',
            explicacion: 'Cuánto te costaron en total los productos que vendiste (lo que gastaste en insumos para esas ventas).'
        }
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {cards.map((card, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Tooltip
                        title={card.explicacion}
                        placement="top"
                        arrow
                        componentsProps={{
                            tooltip: { sx: { maxWidth: 320 } }
                        }}
                    >
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'help',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 2
                                    }}
                                >
                                    <Box
                                        sx={{
                                            bgcolor: `${card.color}15`,
                                            borderRadius: 2,
                                            p: 1.5,
                                            color: card.color
                                        }}
                                    >
                                        {card.icono}
                                    </Box>
                                </Box>
                                <Typography
                                    variant="h5"
                                    component="div"
                                    sx={{
                                        fontWeight: 700,
                                        color: 'text.primary',
                                        mb: 0.5
                                    }}
                                >
                                    {card.valor}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.875rem' }}
                                >
                                    {card.titulo}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Tooltip>
                </Grid>
            ))}
        </Grid>
    );
};

export default ResumenReporte;

