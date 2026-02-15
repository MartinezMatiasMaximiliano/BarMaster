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
    const fechaPedido = item.fechaAgregado;
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState(
        calcularTiempoTranscurrido(fechaPedido)
    );

    // Actualizar tiempo transcurrido cada segundo (antigüedad desde que se agregó el pedido)
    useEffect(() => {
        const interval = setInterval(() => {
            setTiempoTranscurrido(calcularTiempoTranscurrido(fechaPedido));
        }, 1000);

        return () => clearInterval(interval);
    }, [fechaPedido, calcularTiempoTranscurrido]);

    const getColorEstado = () => {
        if (item.estado === 'Listo') return 'success';
        if (item.estado === 'En Preparación') return 'info';
        return 'default';
    };

    const getBorderColor = () => {
        if (item.estado === 'Listo') return 'success.main';
        if (item.estado === 'En Preparación') return 'info.main';
        return 'divider';
    };

    const getBackgroundColor = () => {
        if (item.estado === 'Listo') {
            return 'rgba(76, 175, 80, 0.15)';
        }
        if (item.estado === 'En Preparación') {
            return 'rgba(33, 150, 243, 0.08)';
        }
        return 'rgba(158, 158, 158, 0.04)';
    };

    const getEstadoLabel = () => item.estado || 'Pendiente';

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
                            {item.estado === 'Pendiente' && (
                                <Tooltip title="Marcar como En Preparación">
                                    <IconButton
                                        color="info"
                                        size="small"
                                        onClick={() => onMarcarEnPreparacion(item.id)}
                                        sx={{
                                            color: 'white',
                                            bgcolor: 'info.main',
                                            '&:hover': { bgcolor: 'info.dark', color: 'white' }
                                        }}
                                    >
                                        <PlayArrowIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                            
                            {item.estado !== 'Listo' && (
                                <Tooltip title="Marcar como Listo">
                                    <IconButton
                                        color="success"
                                        size="small"
                                        onClick={() => onMarcarListo(item.id)}
                                        sx={{
                                            color: 'white',
                                            bgcolor: 'success.main',
                                            '&:hover': { bgcolor: 'success.dark', color: 'white' }
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
    return prevProps.item.id === nextProps.item.id &&
           prevProps.item.estado === nextProps.item.estado &&
           (prevProps.item.fechaAgregado ?? prevProps.item.fechaHora) === (nextProps.item.fechaAgregado ?? nextProps.item.fechaHora);
});

PedidoCard.displayName = 'PedidoCard';

export default PedidoCard;

