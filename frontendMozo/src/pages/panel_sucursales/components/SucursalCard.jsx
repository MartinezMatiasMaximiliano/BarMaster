import React from 'react';
import {
    Card,
    Stack,
    Box,
    Typography,
    Divider,
    Button,
    Chip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import TagIcon from '@mui/icons-material/Tag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoginIcon from '@mui/icons-material/Login';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { modulosConfig, planColors } from '../utils/constants';
import { gradientButtonStylesWithTransform } from '../../../styles/buttonStyles';

/**
 * Componente que representa una tarjeta de sucursal individual
 */
const SucursalCard = ({ sucursal, onEnter }) => {
    return (
        <Card
            variant="outlined"
            sx={{
                p: 3,
                width: '100%',
                height: '100%',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'divider',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    bgcolor: 'primary.main',
                    transform: 'scaleY(0)',
                    transition: 'transform 0.3s'
                },
                '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: 'primary.main',
                    '&::before': {
                        transform: 'scaleY(1)'
                    }
                }
            }}
        >
            <Stack spacing={2} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Dirección */}
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mt: 0.5
                        }}
                    >
                        <LocationOnIcon fontSize="small" color="primary" />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                                mb: 0.5,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: '0.7rem',
                                letterSpacing: 0.5
                            }}
                        >
                            Dirección
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 600,
                                color: 'text.primary',
                                lineHeight: 1.4
                            }}
                        >
                            {sucursal.Direccion}
                        </Typography>
                    </Box>
                </Stack>

                {/* Teléfono */}
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: 'success.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mt: 0.5
                        }}
                    >
                        <PhoneIcon fontSize="small" color="success" />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                                mb: 0.5,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: '0.7rem',
                                letterSpacing: 0.5
                            }}
                        >
                            Teléfono
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 600,
                                color: 'text.primary'
                            }}
                        >
                            {sucursal.Telefono}
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />
                
                {/* Plan */}
                {sucursal.Plan && (
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                            <TagIcon fontSize="small" color="primary" />
                            <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    letterSpacing: 0.5
                                }}
                            >
                                Plan
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Chip
                                label={sucursal.Plan.nombre}
                                color={planColors[sucursal.Plan.nombre] || 'default'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                    </Box>
                )}

                {/* Módulos */}
                {sucursal.Modulos && sucursal.Modulos.length > 0 && (
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                            <CheckCircleIcon fontSize="small" color="success" />
                            <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    letterSpacing: 0.5
                                }}
                            >
                                Módulos ({sucursal.Modulos.length})
                            </Typography>
                        </Stack>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                maxHeight: '120px',
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: 'transparent',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    borderRadius: '3px',
                                },
                            }}
                        >
                            {sucursal.Modulos.map((modulo, modIndex) => {
                                const config = modulosConfig[modulo] || {
                                    IconComponent: CheckCircleIcon,
                                    color: 'default'
                                };
                                const IconComponent = config.IconComponent;
                                return (
                                    <Chip
                                        key={modIndex}
                                        icon={
                                            <Box sx={{ color: `${config.color}.main` }}>
                                                <IconComponent />
                                            </Box>
                                        }
                                        label={modulo}
                                        size="small"
                                        variant="outlined"
                                        color={config.color}
                                        sx={{
                                            fontSize: '0.7rem',
                                            height: '24px',
                                            '& .MuiChip-icon': {
                                                fontSize: '16px'
                                            }
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />
                
                {/* Botón Entrar */}
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    startIcon={<LoginIcon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEnter?.(sucursal);
                    }}
                    sx={{
                        mt: 'auto',
                        flexShrink: 0,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1rem',
                        ...gradientButtonStylesWithTransform
                    }}
                >
                    Entrar
                </Button>
            </Stack>
        </Card>
    );
};

export default SucursalCard;

