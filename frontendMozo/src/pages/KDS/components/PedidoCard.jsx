import { memo, useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import { formatearFecha } from '../../../Helpers/HelperFunctions';

/**
 * Componente para mostrar un pedido individual en el KDS
 * Muestra información del pedido y permite cambiar su estado
 */
const PedidoCard = memo(({ 
    item, 
    onMarcarEnPreparacion, 
    onMarcarListo, 
    calcularTiempoTranscurrido 
}) => {
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState(
        calcularTiempoTranscurrido(item.fechaHora)
    );

    // Actualizar tiempo transcurrido cada segundo
    useEffect(() => {
        const interval = setInterval(() => {
            setTiempoTranscurrido(calcularTiempoTranscurrido(item.fechaHora));
        }, 1000);

        return () => clearInterval(interval);
    }, [item.fechaHora, calcularTiempoTranscurrido]);

    // Determinar color según estado
    const getColorEstado = () => {
        if (item.estado === 2) return 'success'; // Listo
        if (item.estado === 1) return 'info'; // En preparación
        return 'default'; // Pendiente
    };

    // Determinar color del borde según estado
    const getBorderColor = () => {
        if (item.estado === 2) return 'success.main'; // Listo
        if (item.estado === 1) return 'info.main'; // En preparación
        return 'divider'; // Pendiente
    };

    // Determinar color de fondo sutil según estado
    const getBackgroundColor = () => {
        if (item.estado === 2) {
            // Verde más opaco para items listos (más visible)
            return 'rgba(76, 175, 80, 0.15)'; // success.main con 15% opacidad
        }
        if (item.estado === 1) {
            // Azul muy sutil para items en preparación
            return 'rgba(33, 150, 243, 0.08)'; // info.main con 8% opacidad
        }
        // Gris muy sutil para items pendientes
        return 'rgba(158, 158, 158, 0.04)'; // Gris muy sutil para pendientes
    };

    const getEstadoLabel = () => {
        switch (item.estado) {
            case 0: return 'Pendiente';
            case 1: return 'En Preparación';
            case 2: return 'Listo';
            default: return 'Pendiente';
        }
    };

    return (
        <Card
            sx={{
                border: 2,
                borderColor: getBorderColor(),
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                },
                bgcolor: getBackgroundColor(),
                height: 350, // Altura FIJA para todas las cards
                width: 300, // Ancho FIJO para todas las cards
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                flexShrink: 0
            }}
        >
            <CardContent sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                p: 2,
                height: '100%',
                boxSizing: 'border-box',
                '&:last-child': { pb: 2 }
            }}>
                <Stack spacing={2} sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                    {/* Header con fecha, hora y mesa */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                {formatearFecha(item.fechaHora)}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <TableRestaurantIcon fontSize="small" color="action" />
                                <Typography variant="body2" fontWeight={600}>
                                    Mesa {item.numeroMesa}
                                </Typography>
                            </Stack>
                        </Box>
                        <Chip
                            label={getEstadoLabel()}
                            color={getColorEstado()}
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                    </Stack>

                    {/* Producto con Cantidad */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 1.5 }}>
                            {/* Cantidad - Muy visible */}
                            <Box
                                sx={{
                                    minWidth: 60,
                                    width: 60,
                                    height: 60,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 2,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    fontWeight: 700,
                                    flexShrink: 0
                                }}
                            >
                                <Typography 
                                    variant="h3" 
                                    component="span"
                                    sx={{ 
                                        fontSize: { xs: '2rem', sm: '2.5rem' },
                                        lineHeight: 1,
                                        fontWeight: 900
                                    }}
                                >
                                    {item.cantidad || 1}
                                </Typography>
                            </Box>
                            
                            {/* Nombre del producto */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <RestaurantIcon fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
                                    <Typography 
                                        variant="h6" 
                                        component="h3" 
                                        fontWeight={700}
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.3
                                        }}
                                    >
                                        {item.nombre}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                        
                        {/* Indicaciones - Altura fija para mantener consistencia */}
                        <Box sx={{ height: 60, display: 'flex', alignItems: 'flex-start' }}>
                            {item.indicaciones ? (
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1,
                                        bgcolor: 'warning.light',
                                        border: '1px solid',
                                        borderColor: 'warning.main',
                                        width: '100%',
                                        height: 60,
                                        display: 'flex',
                                        alignItems: 'center',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontStyle: 'italic',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.4
                                        }}
                                    >
                                        <strong>Indicaciones:</strong> {item.indicaciones}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ width: '100%', height: 60 }} />
                            )}
                        </Box>
                    </Box>

                    {/* Footer con tiempo y acciones */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                {tiempoTranscurrido}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            {item.estado === 0 && (
                                <Tooltip title="Marcar como En Preparación">
                                    <IconButton
                                        color="info"
                                        size="small"
                                        onClick={() => onMarcarEnPreparacion(item.id)}
                                        sx={{
                                            bgcolor: 'info.light',
                                            '&:hover': { bgcolor: 'info.main', color: 'white' }
                                        }}
                                    >
                                        <PlayArrowIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                            
                            {item.estado !== 2 && (
                                <Tooltip title="Marcar como Listo">
                                    <IconButton
                                        color="success"
                                        size="small"
                                        onClick={() => onMarcarListo(item.id)}
                                        sx={{
                                            bgcolor: 'success.light',
                                            '&:hover': { bgcolor: 'success.main', color: 'white' }
                                        }}
                                    >
                                        <CheckCircleIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}, (prevProps, nextProps) => {
    // Optimización: solo re-renderizar si cambian propiedades relevantes
    return prevProps.item.id === nextProps.item.id &&
           prevProps.item.estado === nextProps.item.estado &&
           prevProps.item.fechaHora === nextProps.item.fechaHora;
});

PedidoCard.displayName = 'PedidoCard';

export default PedidoCard;

