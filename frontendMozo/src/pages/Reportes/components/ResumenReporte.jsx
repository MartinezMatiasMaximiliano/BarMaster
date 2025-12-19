import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
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
                .filter(v => v.mesa?.idMozo)
                .map(v => v.mesa.idMozo)
        ).size;
        
        const categoriasVendidas = new Set(
            visitas.flatMap(v => 
                v.productos?.map(p => {
                    const producto = productos.find(prod => prod.nombre === p.nombreProducto);
                    return producto?.idCategoria;
                }).filter(Boolean) || []
            )
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
            categoriasVendidas,
            margenPorcentual,
            totalCostos
        };
    }, [visitas, mesas, productos, metricas]);

    const cards = [
        {
            titulo: 'Total de Ventas',
            valor: formatearMoneda(metricas.totalVentas || 0),
            icono: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
            color: '#1976d2'
        },
        {
            titulo: 'Cantidad de Visitas',
            valor: metricas.cantidadVisitas || 0,
            icono: <ReceiptIcon sx={{ fontSize: 40 }} />,
            color: '#388e3c'
        },
        {
            titulo: 'Promedio por Visita',
            valor: formatearMoneda(metricas.promedioPorVisita || 0),
            icono: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            color: '#f57c00'
        },
        {
            titulo: 'Productos Vendidos',
            valor: metricas.productosVendidos || 0,
            icono: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
            color: '#7b1fa2'
        },
        {
            titulo: 'Margen de Ganancia',
            valor: formatearMoneda(metricas.margenGanancia || 0),
            icono: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            color: '#c62828'
        },
        {
            titulo: 'Total de Pagos',
            valor: metricasAdicionales.totalPagos || 0,
            icono: <PaymentIcon sx={{ fontSize: 40 }} />,
            color: '#0288d1'
        },
        {
            titulo: 'Promedio Productos/Visita',
            valor: metricasAdicionales.promedioProductosPorVisita || 0,
            icono: <InventoryIcon sx={{ fontSize: 40 }} />,
            color: '#5c6bc0'
        },
        {
            titulo: 'Mesas Ocupadas',
            valor: metricasAdicionales.mesasOcupadas || 0,
            icono: <TableRestaurantIcon sx={{ fontSize: 40 }} />,
            color: '#00897b'
        },
        {
            titulo: 'Mozos Activos',
            valor: metricasAdicionales.mozosActivos || 0,
            icono: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: '#7b1fa2'
        },
        {
            titulo: 'Categorías Vendidas',
            valor: metricasAdicionales.categoriasVendidas || 0,
            icono: <CategoryIcon sx={{ fontSize: 40 }} />,
            color: '#f57c00'
        },
        {
            titulo: 'Margen Porcentual',
            valor: formatearPorcentaje(metricasAdicionales.margenPorcentual || 0),
            icono: <PercentIcon sx={{ fontSize: 40 }} />,
            color: '#c62828'
        },
        {
            titulo: 'Total de Costos',
            valor: formatearMoneda(metricasAdicionales.totalCostos || 0),
            icono: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
            color: '#d32f2f'
        }
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {cards.map((card, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, box-shadow 0.2s',
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
                </Grid>
            ))}
        </Grid>
    );
};

export default ResumenReporte;

